'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Minus, Plus, Scan, ShoppingBag, Trash } from '@phosphor-icons/react';
import { cartApi, formatApiError, type CartItem } from '@/lib/api';
import { PageHeading, ProductImage, VerdictBadge } from './ui';
import { useWorkspace } from './workspace';
import s from './workspace.module.css';

export function Cart() {
  const { cart, cartLoaded, refreshCart, openScanner, toast } = useWorkspace();
  const [busy, setBusy] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const goodFits = cart.filter((item) => item.verdict.level === 'good').length;

  async function update(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      await refreshCart();
    } catch (err) {
      toast(formatApiError(err, 'Could not update your cart.'));
    }
    setBusy(false);
  }

  function changeQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return remove(item);
    update(() => cartApi.setQuantity(item.id, quantity));
  }

  function remove(item: CartItem) {
    update(() => cartApi.remove(item.id));
  }

  return (
    <>
      <PageHeading
        title="Your good little haul."
        description="Everything you’ve scanned, all in one place."
        action={
          <button className={s.secondary} onClick={openScanner}>
            <Scan size={18} />
            Scan another
          </button>
        }
      />
      <div className={s.cartLayout}>
        <section className={s.cartPanel}>
          <div className={s.cartPanelHeading}>
            <h2>
              My shopping cart <span>{totalItems} items</span>
            </h2>
          </div>

          {!cartLoaded && <p className={s.emptyNote}>Loading your cart…</p>}

          {cartLoaded && cart.length === 0 && (
            <div className={s.empty}>
              <ShoppingBag size={44} weight="light" />
              <h2>Room for something good.</h2>
              <p>Scan a product and it will show up here.</p>
              <button className={s.primary} onClick={openScanner}>
                Scan your first product <Scan size={18} />
              </button>
            </div>
          )}

          {cart.map((item) => (
            <article className={s.cartRow} key={item.id}>
              <ProductImage product={item.products} small />
              <div className={s.cartProduct}>
                <small>{item.products.brand ?? 'Fresh'}</small>
                <h3>{item.products.name}</h3>
                <span>{item.verdict.headline}</span>
                <VerdictBadge level={item.verdict.level} />
              </div>
              <div className={s.quantity}>
                <button
                  aria-label={`Remove one ${item.products.name}`}
                  disabled={busy}
                  onClick={() => changeQuantity(item, item.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <span aria-live="polite">{item.quantity}</span>
                <button
                  aria-label={`Add one ${item.products.name}`}
                  disabled={busy}
                  onClick={() => changeQuantity(item, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                className={s.iconButton}
                aria-label={`Remove ${item.products.name} from cart`}
                disabled={busy}
                onClick={() => remove(item)}
              >
                <Trash size={17} />
              </button>
            </article>
          ))}
        </section>

        <aside className={s.summary}>
          <span className={s.eyebrow}>AT A GLANCE</span>
          <h2>Your basket.</h2>
          <div className={s.summaryLine}>
            <span>Products</span>
            <strong>{cart.length}</strong>
          </div>
          <div className={s.summaryLine}>
            <span>Total items</span>
            <strong>{totalItems}</strong>
          </div>
          <div className={s.summaryLine}>
            <span>Good fits for you</span>
            <strong>{goodFits}</strong>
          </div>
          <Link href="/recipes" className={s.summaryAsk}>
            <span>
              <strong>Hungry yet?</strong>
              <small>Make a recipe from your cart</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </>
  );
}
