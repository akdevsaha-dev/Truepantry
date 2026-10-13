'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CaretRight,
  Check,
  House,
  Leaf,
  Scan,
  ShoppingBag,
  Sparkle,
  X,
  Camera,
  Minus,
  Plus,
  UserCircle,
} from '@phosphor-icons/react';
import { useAuthStore, useOnboardingStore } from '@/lib/stores';
import { BrandLogo } from '@/components/ui/brand-logo';
import type { User } from '@/lib/api/types';
import { products, type Product } from './mock-data';
import s from './workspace.module.css';

export type ProfileData = { name: string; email: string; goal: string; diet: string };
const defaultProfile: ProfileData = {
  name: 'Jamie Parker',
  email: 'jamie@example.com',
  goal: 'More protein',
  diet: 'Vegetarian',
};
const profileKey = 'carted-preview-profile';

type State = {
  profile: ProfileData;
  profileReady: boolean;
  saveProfile: (profile: ProfileData) => boolean;
  quantities: Record<string, number>;
  change: (id: string, delta: number) => void;
  scan: () => void;
  goal: string;
  toast: (message: string) => void;
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const Context = createContext<State | null>(null);

export function useShop() {
  const value = useContext(Context);
  if (!value) throw new Error('Workspace required');
  return value;
}

export function ProductArt({ product, small = false }: { product: Product; small?: boolean }) {
  return (
    <div
      className={`${s.productArt} ${s[product.color]} ${small ? s.smallArt : ''}`}
      aria-label={`${product.name} illustration`}
      role="img"
    >
      <div className={`${s.package} ${s[product.shape]}`}>
        <span className={s.packageBrand}>carted market</span>
        <strong>{product.label}</strong>
        <span className={s.packageSub}>{product.sub}</span>
        <Leaf size={19} weight="light" aria-hidden="true" />
      </div>
    </div>
  );
}

export function Quantity({ id, value }: { id: string; value: number }) {
  const { change } = useShop();
  return (
    <div className={s.quantity}>
      <button aria-label={`Remove one ${products.find((p) => p.id === id)?.name}`} onClick={() => change(id, -1)}>
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button aria-label={`Add one ${products.find((p) => p.id === id)?.name}`} onClick={() => change(id, 1)}>
        <Plus size={14} />
      </button>
    </div>
  );
}

export function Workspace({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, isAuthenticated, checkAuth, signOut } = useAuthStore();
  const { profile: onboardingData, fetchStatus } = useOnboardingStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({
    yogurt: 1,
    oats: 1,
    milk: 1,
    chickpeas: 2,
  });
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => {
      fetchStatus();
    });
  }, [checkAuth, fetchStatus]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved: unknown = JSON.parse(sessionStorage.getItem(profileKey) || 'null');
        if (
          saved &&
          typeof saved === 'object' &&
          'name' in saved &&
          'email' in saved &&
          'goal' in saved &&
          'diet' in saved &&
          typeof saved.name === 'string' &&
          saved.name.trim() &&
          typeof saved.email === 'string' &&
          typeof saved.goal === 'string' &&
          typeof saved.diet === 'string'
        ) {
          setProfile({ name: saved.name, email: saved.email, goal: saved.goal, diet: saved.diet });
        } else if (user) {
          setProfile({
            name: user.username,
            email: user.email,
            goal: onboardingData.goal || 'More balanced',
            diet: onboardingData.diet || 'Vegetarian',
          });
        }
      } catch {
        /* Keep default */
      }
      setProfileReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [user, onboardingData]);

  function saveProfile(next: ProfileData) {
    try {
      sessionStorage.setItem(profileKey, JSON.stringify(next));
    } catch {
      return false;
    }
    setProfile(next);
    return true;
  }

  const initial = (user?.username || profile.name).charAt(0).toUpperCase();
  const [notice, setNotice] = useState('');
  const [scanning, setScanning] = useState(false);
  const isChat = path === '/chat';
  const count = Object.values(quantities).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const change = (id: string, delta: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }));

  const nav = [
    { href: '/dashboard', label: 'Overview', icon: House },
    { href: '/chat', label: 'Ask Carted', icon: Sparkle },
    { href: '/cart', label: 'My cart', icon: ShoppingBag },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <Context.Provider
      value={{
        profile,
        profileReady,
        saveProfile,
        quantities,
        change,
        scan: () => setScanning(true),
        goal: onboardingData.goal || profile.goal,
        toast: setNotice,
        user,
        isAuthenticated,
        signOut,
      }}
    >
      <div className={`${s.workspace} ${isChat ? s.chatWorkspace : ''}`}>
        {!isChat && (
          <aside className={s.sidebar}>
            <div className="mb-4">
              <BrandLogo showDot={true} />
            </div>
            <nav aria-label="Main navigation">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${s.navItem} ${path === href ? s.active : ''}`}
                  aria-current={path === href ? 'page' : undefined}
                >
                  <Icon size={21} weight={path === href ? 'fill' : 'regular'} aria-hidden="true" />
                  <span>{label}</span>
                  {href === '/cart' && <span className={s.count}>{count}</span>}
                  {path === href && href !== '/cart' && <span className={s.activeDot} />}
                </Link>
              ))}
            </nav>
            <button className={s.sidebarScan} onClick={() => setScanning(true)}>
              <Scan size={21} />
              Scan a product<span>+</span>
            </button>
            <div className={s.sidebarBottom}>
              <div className={s.littleNote}>
                <Leaf size={25} weight="light" />
                <h3>
                  Little choices.
                  <br />
                  Lovely changes.
                </h3>
                <p>A little intention in every basket.</p>
                <Link href="/chat">
                  Find your next good pick <ArrowUpRight size={16} />
                </Link>
              </div>
              <Link href="/profile" className={s.profile}>
                <span className={s.avatar}>{initial}</span>
                <span>
                  <strong>{user?.username || profile.name}</strong>
                  <small>{isAuthenticated ? 'Signed in account' : 'Personal preview'}</small>
                </span>
                <CaretRight size={16} />
              </Link>
            </div>
          </aside>
        )}
        <div className={s.mainColumn}>
          <main id="main-content" className={`${s.content} ${isChat ? s.chatContent : ''}`}>
            {children}
          </main>
          {!isChat && (
            <footer className={s.footer}>
              A little clarity for your everyday groceries.
              <span>
                Made for your kind of shopping <Leaf size={13} />
              </span>
            </footer>
          )}
        </div>
        {notice && (
          <div role="status" className={s.toast}>
            <Check size={18} />
            {notice}
          </div>
        )}
        {scanning && <Scanner close={() => setScanning(false)} />}
      </div>
    </Context.Provider>
  );
}

function Scanner({ close }: { close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const [status, setStatus] = useState('Your camera is only used while this window is open.');
  const [started, setStarted] = useState(false);
  const [sample, setSample] = useState(false);
  const { change, toast } = useShop();

  useEffect(() => {
    alive.current = true;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      alive.current = false;
      stream.current?.getTracks().forEach((t) => t.stop());
      document.body.style.overflow = previous;
    };
  }, []);

  async function camera() {
    setStarted(true);
    setStatus('Waiting for camera permission…');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unavailable');
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (!alive.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      if (video.current) video.current.srcObject = media;
      setStatus('Camera ready. Product recognition is coming soon; try a sample below.');
    } catch {
      if (alive.current) {
        setStarted(false);
        setStatus('Camera unavailable. Allow camera access in your browser, or try the sample scan.');
      }
    }
  }

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
      <p>{sample ? 'Sample product · illustrative nutrition and price' : 'Point your camera at a product label or barcode.'}</p>
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
          <div className={s.cameraView}>
            <video ref={video} autoPlay playsInline muted />
            <div className={s.scanFrame}>
              <Scan size={58} weight="thin" />
            </div>
          </div>
          <p role="status" className={s.cameraStatus}>
            {status}
          </p>
          <button className={s.primary} onClick={camera} disabled={started}>
            <Camera size={18} />
            {started ? 'Camera session open' : 'Open camera'}
          </button>
          <button
            className={s.sampleButton}
            onClick={() => {
              alive.current = false;
              stream.current?.getTracks().forEach((t) => t.stop());
              setSample(true);
            }}
          >
            Try a sample scan <ArrowUpRight size={16} />
          </button>
        </>
      )}
    </dialog>
  );
}
