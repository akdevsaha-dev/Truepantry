'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle, CookingPot, Scan, ShoppingBag, Target, Warning } from '@phosphor-icons/react';
import { goalLabel } from '@/lib/preferences';
import { useAuthStore, useOnboardingStore } from '@/lib/stores';
import { PageHeading, ProductImage, VerdictBadge } from './ui';
import { useWorkspace } from './workspace';
import s from './workspace.module.css';

export function Dashboard() {
  const { cart, openScanner } = useWorkspace();
  const user = useAuthStore((state) => state.user);
  const goal = useOnboardingStore((state) => state.profile.goal);

  const goodFits = cart.filter((item) => item.verdict.level === 'good').length;
  const toWatch = cart.length - goodFits;
  const recent = [...cart].reverse().slice(0, 4);

  return (
    <>
      <PageHeading
        title={`Good things in store, ${user?.username ?? 'there'}.`}
        description="A fresh start for your next grocery run."
        action={
          <button className={s.secondary} onClick={openScanner}>
            <Scan size={18} />
            Start shopping
          </button>
        }
      />

      <div className={s.dashboardGrid}>
        <section className={s.scanHero}>
          <div className={s.heroCopy}>
            <span className={s.pill}>
              <span />
              Your in-aisle companion
            </span>
            <h2>
              Good choices start
              <br />
              with a little clarity.
            </h2>
            <p>
              Ingredients, nutrition, and what fits you.
              <br />
              Just point. We’ll take it from here.
            </p>
            <button className={s.primary} onClick={openScanner}>
              <Scan size={19} />
              Scan a product
              <ArrowUpRight size={17} />
            </button>
          </div>
          <div className={s.heroArt}>
            <Image
              src="/images/truepantry-grocery-cart-transparent.png"
              alt="A shopping cart filled with fresh groceries"
              fill
              sizes="(max-width: 700px) 220px, 340px"
              priority
            />
          </div>
        </section>
        <section className={s.goalCard}>
          <span className={s.cardIcon}>
            <Target size={23} />
          </span>
          <span className={s.eyebrow}>YOUR GOAL</span>
          <h2>{goalLabel(goal)}</h2>
          <p>Every scan is checked against this goal and your diet.</p>
          <Link href="/profile">
            Change your preferences <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      <div className={s.stats}>
        <div>
          <span className={s.statIcon}>
            <ShoppingBag size={20} />
          </span>
          <span>
            <small>In your cart</small>
            <strong>
              {cart.length} <em>products</em>
            </strong>
          </span>
        </div>
        <div>
          <span className={s.statIcon}>
            <CheckCircle size={20} />
          </span>
          <span>
            <small>Good fits</small>
            <strong>{goodFits}</strong>
          </span>
        </div>
        <div>
          <span className={s.statIcon}>
            <Warning size={20} />
          </span>
          <span>
            <small>Worth a second look</small>
            <strong>{toWatch}</strong>
          </span>
        </div>
      </div>

      <div className={s.sectionHeading}>
        <div>
          <h2>Recently scanned</h2>
          <p>The latest products you added to your cart.</p>
        </div>
        <Link href="/cart">
          View my cart <ArrowRight size={17} />
        </Link>
      </div>
      {recent.length ? (
        <div className={s.productGrid}>
          {recent.map((item) => (
            <article key={item.id} className={s.productCard}>
              <ProductImage product={item.products} />
              <div className={s.productInfo}>
                <span className={s.productCategory}>
                  {item.products.brand ?? 'Fresh'}
                  <span>×{item.quantity}</span>
                </span>
                <h3>{item.products.name}</h3>
                <VerdictBadge level={item.verdict.level} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={s.emptyNote}>Nothing scanned yet. Scan your first product to get started.</p>
      )}

      <div className={s.bottomGrid}>
        <Link href="/recipes" className={s.askCard}>
          <span className={s.cardIcon}>
            <CookingPot size={25} weight="light" />
          </span>
          <div>
            <span className={s.eyebrow}>RECIPES FROM YOUR CART</span>
            <h2>“What can I make with what’s in my cart?”</h2>
            <p>Get a recipe, then ask anything about it.</p>
            <strong>
              Let’s cook <ArrowUpRight size={17} />
            </strong>
          </div>
        </Link>
      </div>
    </>
  );
}
