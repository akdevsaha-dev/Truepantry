'use client';

import { useEffect, useRef } from 'react';
import { ArrowCounterClockwise, Barcode, Camera, Scan, X } from '@phosphor-icons/react';
import { useScanner, type ScanHint } from '@/lib/scanner/use-scanner';
import { VerdictBadge, verdictClasses } from './ui';
import { useWorkspace } from './workspace';
import s from './workspace.module.css';

const hints: Record<ScanHint, string> = {
  'hold-steady': 'Hold the item steady.',
  looking: 'Looking for a barcode… No barcode? Keep holding it steady.',
  identifying: 'No barcode found. Identifying from the image…',
};

export function Scanner({ close }: { close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { refreshCart, toast } = useWorkspace();
  const { videoRef, phase, hint, result, guess, error, start, rescan, skipBarcode, confirm } = useScanner();

  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // a successful scan has already been added to the cart by the backend
  useEffect(() => {
    if (!result) return;
    refreshCart();
    toast(`${result.item.name} added to your cart`);
  }, [result, refreshCart, toast]);

  const cameraOpen = phase !== 'idle' && phase !== 'starting';
  let status = hints[hint];
  if (phase === 'idle') status = error || 'Your camera is only used while this window is open.';
  if (phase === 'starting') status = 'Waiting for camera permission…';
  if (phase === 'evaluating' && hint !== 'identifying') status = 'Checking this item against your profile…';

  return (
    <dialog
      ref={dialog}
      className={s.dialog}
      aria-labelledby="scanner-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={s.dialogHeader}>
        <span className={s.eyebrow}>SCAN A PRODUCT</span>
        <button className={s.iconButton} onClick={close} aria-label="Close scanner">
          <X size={20} />
        </button>
      </div>
      <h2 id="scanner-title">What’s in your hand?</h2>
      <p>Point your camera at the barcode. For loose produce, just show the item.</p>

      {/* The video stays mounted for the whole session so the stream is never lost. */}
      <div className={s.cameraView} hidden={phase === 'result' || phase === 'confirm' || phase === 'error'}>
        <video ref={videoRef} autoPlay playsInline muted />
        <div className={`${s.scanFrame} ${phase === 'evaluating' ? s.scanFrameBusy : ''}`}>
          <Scan size={58} weight="thin" />
        </div>
      </div>

      {phase === 'result' && result && (
        <section className={`${s.verdict} ${verdictClasses[result.verdict.level]}`} aria-live="assertive">
          <VerdictBadge level={result.verdict.level} />
          <h3>
            {result.item.name}
            {result.item.brand && <small> · {result.item.brand}</small>}
          </h3>
          <p className={s.verdictHeadline}>{result.verdict.headline}</p>
          {result.verdict.reasons.length > 0 && (
            <ul>
              {result.verdict.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {phase === 'confirm' && guess && (
        <section className={s.verdict} aria-live="polite">
          <h3>Is this {guess}?</h3>
          <p className={s.verdictHeadline}>We weren’t sure from the picture. Confirm so the advice is accurate.</p>
          <div className={s.confirmRow}>
            <button className={s.primary} onClick={() => confirm(true)}>
              Yes, that’s it
            </button>
            <button className={s.secondary} onClick={() => confirm(false)}>
              No, rescan
            </button>
          </div>
        </section>
      )}

      {phase === 'error' && (
        <p role="alert" className={s.cameraStatus}>
          {error}
        </p>
      )}

      {(phase === 'idle' || phase === 'starting' || phase === 'scanning' || phase === 'evaluating') && (
        <p role="status" className={s.cameraStatus}>
          {status}
        </p>
      )}

      {!cameraOpen && (
        <button className={s.primary} onClick={start} disabled={phase === 'starting'}>
          <Camera size={18} />
          Open camera
        </button>
      )}
      {(phase === 'scanning' || phase === 'evaluating') && (
        <button className={s.secondary} onClick={skipBarcode} disabled={phase !== 'scanning'}>
          <Barcode size={18} />
          No barcode — identify from image
        </button>
      )}
      {(phase === 'result' || phase === 'error') && (
        <button className={s.primary} onClick={rescan}>
          <ArrowCounterClockwise size={18} />
          Scan another item
        </button>
      )}
    </dialog>
  );
}
