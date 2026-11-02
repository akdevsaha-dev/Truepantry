'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ArrowUpRight, CaretRight, Check, CookingPot, House, Leaf, Scan, ShoppingBag, UserCircle } from '@phosphor-icons/react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { cartApi, type CartItem } from '@/lib/api';
import { useAuthStore, useOnboardingStore } from '@/lib/stores';
import { Scanner } from './scanner';
import s from './workspace.module.css';

type WorkspaceState = {
  cart: CartItem[];
  cartLoaded: boolean;
  refreshCart: () => Promise<void>;
  openScanner: () => void;
  toast: (message: string) => void;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside <Workspace>');
  return value;
}

const nav = [
  { href: '/dashboard', label: 'Overview', icon: House },
  { href: '/recipes', label: 'Recipes', icon: CookingPot },
  { href: '/cart', label: 'My cart', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function Workspace({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { user, isAuthenticated, isInitialized, checkAuth } = useAuthStore();
  const fetchOnboarding = useOnboardingStore((state) => state.fetchStatus);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState('');

  const refreshCart = useCallback(async () => {
    try {
      setCart(await cartApi.list());
    } catch {
      setNotice('Could not load your cart.');
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    checkAuth().then((currentUser) => {
      if (!currentUser) {
        router.replace('/sign-in?from=' + encodeURIComponent(path));
        return;
      }
      fetchOnboarding();
      refreshCart();
    });
    // only on first load, page changes don't need a fresh auth check
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  if (!isInitialized || !isAuthenticated || !user) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#fafbf9]">
        <p className="text-xs font-medium text-[#686c67]">Checking access…</p>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <WorkspaceContext.Provider
      value={{ cart, cartLoaded, refreshCart, openScanner: () => setScanning(true), toast: setNotice }}
    >
      <div className={s.workspace}>
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
                {href === '/cart' && <span className={s.count}>{cartCount}</span>}
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
              <p>Turn what’s in your cart into a meal.</p>
              <Link href="/recipes">
                Find a recipe <ArrowUpRight size={16} />
              </Link>
            </div>
            <Link href="/profile" className={s.profile}>
              <span className={s.avatar}>{user.username.charAt(0).toUpperCase()}</span>
              <span>
                <strong>{user.username}</strong>
                <small>{user.email}</small>
              </span>
              <CaretRight size={16} />
            </Link>
          </div>
        </aside>
        <div className={s.mainColumn}>
          <main id="main-content" className={s.content}>
            {children}
          </main>
        </div>
        {notice && (
          <div role="status" className={s.toast}>
            <Check size={18} />
            {notice}
          </div>
        )}
        {scanning && <Scanner close={() => setScanning(false)} />}
      </div>
    </WorkspaceContext.Provider>
  );
}
