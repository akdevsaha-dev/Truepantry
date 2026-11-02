import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { evaluateApi, formatApiError } from "@/lib/api";
import type { EvaluateRequest, Product, Verdict } from "@/lib/api";
import { createBarcodeReader, type BarcodeReader } from "./barcode";
import { motion, sharpness, toGray } from "./frame-quality";

// Tuning knobs. Adjust these from real scan logs.
const SAMPLE_INTERVAL_MS = 150; // ~7 fps is plenty for barcodes and steadiness
const BARCODE_GRACE_MS = 2000; // steady time with no barcode before falling back to vision
const MIN_IMAGE_INTERVAL_MS = 2500; // client-side guard against back-to-back vision calls
const STEADY_MOTION = 6; // mean abs pixel diff (0–255) below which the frame counts as steady
const ANALYSIS_WIDTH = 160; // small frame used for motion and sharpness
const UPLOAD_MAX_WIDTH = 768; // frame size for barcode decoding and vision upload
const BUFFER_SIZE = 6; // recent frames kept so we can send the sharpest one

export type ScanPhase = "idle" | "starting" | "scanning" | "evaluating" | "confirm" | "result" | "error";

export type ScanHint = "hold-steady" | "looking" | "identifying";

type BufferedFrame = { canvas: HTMLCanvasElement; sharpness: number };

export function useScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [hint, setHint] = useState<ScanHint>("looking");
  const [result, setResult] = useState<{ item: Product; verdict: Verdict; quantity: number } | null>(null);
  const [guess, setGuess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The sampling loop reads these on every tick, so they live in refs rather
  // than state to avoid stale closures and needless re-renders.
  const phaseRef = useRef<ScanPhase>("idle");
  const sourceRef = useRef<EvaluateRequest["source"] | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);
  const reader = useRef<BarcodeReader | null>(null);
  const decoding = useRef(false);
  const prevGray = useRef<Uint8Array | null>(null);
  const steadySince = useRef<number | null>(null);
  const lastImageAt = useRef(0);
  const frames = useRef<BufferedFrame[]>([]);
  const analysis = useRef<HTMLCanvasElement | null>(null);
  const alive = useRef(true);

  const go = useCallback((next: ScanPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const evaluate = useCallback(
    async (request: EvaluateRequest) => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      sourceRef.current = request.source;
      if (request.source === "image") lastImageAt.current = Date.now();
      setHint(request.source === "image" ? "identifying" : "looking");
      go("evaluating");

      try {
        const response = await evaluateApi.evaluate(request, controller.signal);
        if (controller.signal.aborted || !alive.current) return;

        if (response.status === "ok") {
          setResult({ item: response.item, verdict: response.verdict, quantity: response.quantity });
          go("result");
        } else if (response.status === "needs_image") {
          // Barcode unknown to every database: identify from the picture instead.
          if (request.source === "barcode" && sendBestFrame()) return;
          setError(response.message || "We couldn't identify this item. Try another angle.");
          go("error");
        } else {
          setGuess(response.guess);
          go("confirm");
        }
      } catch (err) {
        if (axios.isCancel(err) || controller.signal.aborted || !alive.current) return;
        setError(formatApiError(err, "Something went wrong while checking this item."));
        go("error");
      }
    },
    // sendBestFrame is defined below and only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [go],
  );

  /** Sends the sharpest buffered frame to vision. Returns false if there is nothing to send. */
  function sendBestFrame(): boolean {
    const best = frames.current.reduce<BufferedFrame | null>(
      (top, f) => (!top || f.sharpness > top.sharpness ? f : top),
      null,
    );
    if (!best) return false;
    const image = best.canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    steadySince.current = null;
    void evaluate({ source: "image", image });
    return true;
  }

  const onBarcode = useCallback(
    (barcode: string) => {
      const current = phaseRef.current;
      // An exact barcode always beats a vision guess, so it cancels an
      // in-flight image request. A barcode request already running is left alone.
      if (current === "scanning" || (current === "evaluating" && sourceRef.current === "image")) {
        void evaluate({ source: "barcode", barcode });
      }
    },
    [evaluate],
  );

  const tick = useCallback(() => {
    const video = videoRef.current;
    const current = phaseRef.current;
    // Keep sampling while a request is in flight: a barcode can still win over
    // an image request, and an unknown barcode needs fresh frames to fall back on.
    if (!alive.current || (current !== "scanning" && current !== "evaluating")) return;

    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      const now = Date.now();

      // 1. Steadiness from a tiny grayscale copy of the frame.
      const aw = ANALYSIS_WIDTH;
      const ah = Math.round((video.videoHeight / video.videoWidth) * aw);
      const small = (analysis.current ??= document.createElement("canvas"));
      small.width = aw;
      small.height = ah;
      const sctx = small.getContext("2d", { willReadFrequently: true })!;
      sctx.drawImage(video, 0, 0, aw, ah);
      const gray = toGray(sctx.getImageData(0, 0, aw, ah).data, aw, ah);
      const moved = prevGray.current ? motion(prevGray.current, gray) : Infinity;
      prevGray.current = gray;
      const steady = moved < STEADY_MOTION;
      if (!steady) steadySince.current = null;
      else steadySince.current ??= now;

      // 2. Keep a ring buffer of larger frames, scored by sharpness.
      const scale = Math.min(1, UPLOAD_MAX_WIDTH / video.videoWidth);
      const fw = Math.round(video.videoWidth * scale);
      const fh = Math.round(video.videoHeight * scale);
      const recycled = frames.current.length >= BUFFER_SIZE ? frames.current.shift()!.canvas : null;
      const canvas = recycled ?? document.createElement("canvas");
      canvas.width = fw;
      canvas.height = fh;
      const fctx = canvas.getContext("2d", { willReadFrequently: true })!;
      fctx.drawImage(video, 0, 0, fw, fh);
      if (steady) frames.current.push({ canvas, sharpness: sharpness(gray, aw, ah) });

      // 3. Barcode decode runs continuously, one frame at a time.
      if (reader.current && !decoding.current) {
        decoding.current = true;
        reader
          .current(fctx.getImageData(0, 0, fw, fh))
          .then((code) => code && onBarcode(code))
          .catch(() => undefined)
          .finally(() => {
            decoding.current = false;
          });
      }

      // 4. Fall back to vision once the item has been steady with no barcode.
      if (current === "scanning") {
        setHint(steady ? "looking" : "hold-steady");
        const steadyFor = steadySince.current ? now - steadySince.current : 0;
        if (steadyFor >= BARCODE_GRACE_MS && now - lastImageAt.current >= MIN_IMAGE_INTERVAL_MS) {
          sendBestFrame();
        }
      }
    }

    timer.current = setTimeout(tick, SAMPLE_INTERVAL_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBarcode]);

  const resetScan = useCallback(() => {
    abort.current?.abort();
    clearTimer();
    frames.current = [];
    prevGray.current = null;
    steadySince.current = null;
    sourceRef.current = null;
    setResult(null);
    setGuess(null);
    setError(null);
    setHint("looking");
  }, []);

  const rescan = useCallback(() => {
    resetScan();
    go("scanning");
    tick();
  }, [go, resetScan, tick]);

  const start = useCallback(async () => {
    go("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unavailable");
      const [media, barcodeReader] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        }),
        createBarcodeReader().catch(() => null),
      ]);
      if (!alive.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      reader.current = barcodeReader;
      if (videoRef.current) videoRef.current.srcObject = media;
      rescan();
    } catch {
      if (!alive.current) return;
      setError("Camera unavailable. Allow camera access in your browser and try again.");
      go("idle");
    }
  }, [go, rescan]);

  /** "No barcode" button: skip the wait and identify from the image now. */
  const skipBarcode = useCallback(() => {
    if (phaseRef.current !== "scanning") return;
    if (!sendBestFrame()) setHint("hold-steady");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Answer to "Is this X?". */
  const confirm = useCallback(
    (yes: boolean) => {
      if (yes && guess) void evaluate({ source: "label", label: guess });
      else rescan();
    },
    [evaluate, guess, rescan],
  );

  const stop = useCallback(() => {
    resetScan();
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    go("idle");
  }, [go, resetScan]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      abort.current?.abort();
      clearTimer();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, phase, hint, result, guess, error, start, stop, rescan, skipBarcode, confirm };
}
