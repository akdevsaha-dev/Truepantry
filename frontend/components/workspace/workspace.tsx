'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  CaretRight,
  Check,
  House,
  Leaf,
  Scan,
  ShoppingBag,
  Sparkle,
  Minus,
  Plus,
  UserCircle,
} from '@phosphor-icons/react';
import { useAuthStore, useOnboardingStore } from '@/lib/stores';
import { BrandLogo } from '@/components/ui/brand-logo';
import type { User } from '@/lib/api/types';
import { products, type Product } from './mock-data';
import { Scanner } from './scanner';
import s from './workspace.module.css';

export type ProfileData = { name: string; email: string; goal: string; diet: string };
const defaultProfile: ProfileData = {
  name: 'Jamie Parker',
  email: 'jamie@example.com',
  goal: 'More protein',
  diet: 'Vegetarian',
};
const profileKey = 'truepantry-preview-profile';

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
        <span className={s.packageBrand}>truePantry market</span>
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
  const router = useRouter();
  const path = usePathname();
  const { user, isAuthenticated, isInitialized, checkAuth, signOut } = useAuthStore();
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
    checkAuth().then((currentUser) => {
      if (!currentUser) {
        router.replace('/sign-in?from=' + encodeURIComponent(path));
      } else {
        fetchStatus();
      }
    });
  }, [checkAuth, fetchStatus, path, router]);

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

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex h-screen h-[100dvh] w-full items-center justify-center bg-[#fafbf9]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className="size-7 animate-spin rounded-full border-2 border-[#254b36]/20 border-t-[#254b36]"
            aria-hidden="true"
          />
          <p className="text-xs font-medium tracking-tight text-[#686c67]">Checking access…</p>
        </div>
      </div>
    );
  }

  const change = (id: string, delta: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }));

  const nav = [
    { href: '/dashboard', label: 'Overview', icon: House },
    { href: '/chat', label: 'Ask truePantry', icon: Sparkle },
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
