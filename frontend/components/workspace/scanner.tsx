'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowCounterClockwise,
  ArrowUpRight,
  Barcode,
  Camera,
  Plus,
  Scan,
  SpeakerHigh,
  X,
} from '@phosphor-icons/react';
import { useScanner, type ScanHint } from '@/lib/scanner/use-scanner';
import type { VerdictLevel } from '@/lib/api/types';
import { products } from './mock-data';
import { ProductArt, useShop } from './workspace';
import s from './workspace.module.css';

const hints: Record<ScanHint, string> = {
  'hold-steady': 'Hold the item steady.',
  looking: 'Looking for a barcode… No barcode? Keep holding it steady.',
  identifying: 'No barcode found. Identifying from the image…',
};

const levels: Record<VerdictLevel, { label: string; className: string }> = {
  good: { label: 'Good fit', className: s.verdictGood },
  caution: { label: 'Caution', className: s.verdictCaution },
  avoid: { label: 'Not for you', className: s.verdictAvoid },
};

export function Scanner({ close }: { close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [sample, setSample] = useState(false);
  const { change, toast } = useShop();
  const { videoRef, phase, hint, result, guess, error, start, stop, rescan, skipBarcode, confirm } = useScanner();

  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const cameraOpen = phase !== 'idle' && phase !== 'starting';
  const status =
    phase === 'idle'
      ? error || 'Your camera is only used while this window is open.'
      : phase === 'starting'
        ? 'Waiting for camera permission…'
        : phase === 'evaluating' && hint !== 'identifying'
          ? 'Checking this item against your profile…'
          : hints[hint];

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
        <span className={s.eyebrow}>A LITTLE LABEL CLARITY</span>
        <button className={s.iconButton} onClick={close} aria-label="Close scanner">
          <X size={20} />
        </button>
      </div>
      <h2 id="scanner-title">{sample ? 'Meet your next good pick.' : 'What’s in your hand?'}</h2>
      <p>
        {sample
          ? 'Sample product · illustrative nutrition and price'
          : 'Point your camera at the barcode. For loose produce, just show the item.'}
      </p>

      {sample ? (
        <>
          <ProductArt product={products[0]} />
          <h3>Greek yogurt</h3>
          <p>18 g protein per sample serving · $4.50</p>
          <button
            className={s.primary}
            onClick={() => {
              change('yogurt', 1);
              toast('Greek yogurt added to your cart');
              close();
            }}
          >
            Add to my cart <Plus size={18} />
          </button>
        </>
      ) : (
        <>
          {/* The video stays mounted for the whole session so the stream is never lost. */}
          <div className={s.cameraView} hidden={phase === 'result' || phase === 'confirm' || phase === 'error'}>
            <video ref={videoRef} autoPlay playsInline muted />
            <div className={`${s.scanFrame} ${phase === 'evaluating' ? s.scanFrameBusy : ''}`}>
              <Scan size={58} weight="thin" />
            </div>
          </div>

          {phase === 'result' && result && (
            <section className={`${s.verdict} ${levels[result.verdict.level].className}`} aria-live="assertive">
              <span className={s.verdictBadge}>
                {levels[result.verdict.level].label}
              </span>
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
              <p className={s.verdictSpoken}>
                <SpeakerHigh size={14} /> “{result.verdict.spoken}”
              </p>
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

          {!cameraOpen ? (
            <button className={s.primary} onClick={start} disabled={phase === 'starting'}>
              <Camera size={18} />
              Open camera
            </button>
          ) : phase === 'scanning' || phase === 'evaluating' ? (
            <button className={s.secondary} onClick={skipBarcode} disabled={phase !== 'scanning'}>
              <Barcode size={18} />
              No barcode — identify from image
            </button>
          ) : phase !== 'confirm' ? (
            <button className={s.primary} onClick={rescan}>
              <ArrowCounterClockwise size={18} />
              Scan another item
            </button>
          ) : null}

          {!cameraOpen && (
            <button
              className={s.sampleButton}
              onClick={() => {
                stop();
                setSample(true);
              }}
            >
              Try a sample scan <ArrowUpRight size={16} />
            </button>
          )}
        </>
      )}
    </dialog>
  );
}
