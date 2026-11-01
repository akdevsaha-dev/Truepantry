// Retail barcode reader. Uses the native BarcodeDetector where the browser
// has it (Chrome on Android) and falls back to zxing-wasm everywhere else,
// notably Safari/iOS, which has no BarcodeDetector.

export type BarcodeReader = (frame: ImageData) => Promise<string | null>;

type NativeDetector = { detect(source: ImageData): Promise<{ rawValue: string }[]> };
type NativeDetectorCtor = {
  new (options: { formats: string[] }): NativeDetector;
  getSupportedFormats(): Promise<string[]>;
};

const NATIVE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

export async function createBarcodeReader(): Promise<BarcodeReader> {
  const Native = (globalThis as { BarcodeDetector?: NativeDetectorCtor }).BarcodeDetector;
  if (Native) {
    try {
      const supported = await Native.getSupportedFormats();
      const formats = NATIVE_FORMATS.filter((f) => supported.includes(f));
      if (formats.length > 0) {
        const detector = new Native({ formats });
        return async (frame) => (await detector.detect(frame))[0]?.rawValue ?? null;
      }
    } catch {
      // Fall through to zxing.
    }
  }

  const { readBarcodes } = await import("zxing-wasm/reader");
  return async (frame) => {
    const results = await readBarcodes(frame, {
      formats: ["EAN13", "EAN8", "UPCA", "UPCE"],
      maxNumberOfSymbols: 1,
      tryHarder: true,
    });
    return results.find((r) => r.isValid)?.text ?? null;
  };
}
