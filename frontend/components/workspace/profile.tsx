"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Check, Leaf, SignOut, UserCircle } from "@phosphor-icons/react";
import { useAuthStore } from "@/lib/stores";
import { useShop, type ProfileData } from "./workspace";
import s from "./workspace.module.css";

export function Profile() {
  const { profile, profileReady } = useShop();
  return (
    <>
      <div className={s.pageHeading}>
        <div>
          <h1>A little more you.</h1>
          <p>Your details, your preferences, and your plan. All together.</p>
        </div>
      </div>
      {profileReady ? <ProfileForm initial={profile} /> : <p role="status">Loading your profile…</p>}
    </>
  );
}

function ProfileForm({ initial }: { initial: ProfileData }) {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { profile, saveProfile, toast } = useShop();
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
  const [saveError, setSaveError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const dirty = Object.keys(draft).some(
    (key) => draft[key as keyof ProfileData] !== profile[key as keyof ProfileData]
  );

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/sign-in");
    } finally {
      setSigningOut(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = { ...draft, name: draft.name.trim(), email: draft.email.trim() };
    const validation: typeof errors = {};
    if (!next.name) validation.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) validation.email = "Enter a valid email address.";
    setErrors(validation);
    setSaveError("");
    const first = Object.keys(validation)[0];
    if (first) {
      (form.current?.elements.namedItem(first) as HTMLInputElement)?.focus();
      return;
    }
    if (!saveProfile(next)) {
      setSaveError("Your changes couldn’t be saved. Allow browser storage and try again. Your edits are still here.");
      return;
    }
    setDraft(next);
    toast("Profile saved for this browser session");
  }

  return (
    <div className={s.profileLayout}>
      <form ref={form} onSubmit={submit} noValidate className={s.profileForm}>
        <section className={s.profilePanel} aria-labelledby="details-title">
          <div className={s.sectionHeading}>
            <div>
              <h2 id="details-title">Personal information</h2>
              <p>Make yourself at home.</p>
            </div>
            <UserCircle size={24} aria-hidden="true" />
          </div>

          <div className={s.profileIdentity}>
            <span className={s.avatar} aria-hidden="true">
              {(user?.username || profile.name).charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user?.username || profile.name}</strong>
              <p>{user?.email || profile.email}</p>
              {isAuthenticated ? (
                <span className="inline-block mt-1 text-[11px] font-semibold text-[#254b36] bg-[#e4edda] px-2 py-0.5 rounded-full">
                  Signed in account
                </span>
              ) : (
                <span className="inline-block mt-1 text-[11px] font-medium text-[#686c67] bg-[#f2f4eb] px-2 py-0.5 rounded-full">
                  Preview mode
                </span>
              )}
            </div>
          </div>

          {!isAuthenticated && (
            <div className="rounded-xl border border-[#d5d8d1] bg-[#f9faf7] p-3.5 text-xs text-[#555a53] flex items-center justify-between">
              <span>Connect an account to sync preferences to the cloud.</span>
              <div className="flex gap-2">
                <Link href="/sign-in" className="font-semibold text-[#254b36] hover:underline">
                  Sign in
                </Link>
                <span>·</span>
                <Link href="/sign-up" className="font-semibold text-[#254b36] hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          )}

          <div className={s.profileFields}>
            <div>
              <label htmlFor="profile-name">Full name</label>
              <input
                id="profile-name"
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p className={s.fieldError} id="name-error">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p className={s.fieldError} id="email-error">
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={s.profilePanel} id="preferences" aria-labelledby="preferences-title">
          <div className={s.sectionHeading}>
            <div>
              <h2 id="preferences-title">Shopping preferences</h2>
              <p>A few details to help shape your next pick.</p>
            </div>
            <Leaf size={22} aria-hidden="true" />
          </div>
          <div className={s.profileFields}>
            <div>
              <label htmlFor="profile-goal">My shopping goal</label>
              <select
                id="profile-goal"
                value={draft.goal}
                onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
              >
                <option>More protein</option>
                <option>Eat more mindfully</option>
                <option>Spend a little less</option>
                <option>Shop sustainably</option>
              </select>
            </div>
            <div>
              <label htmlFor="profile-diet">Dietary preference</label>
              <select
                id="profile-diet"
                value={draft.diet}
                onChange={(e) => setDraft({ ...draft, diet: e.target.value })}
              >
                <option>No preference</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Pescatarian</option>
                <option>Flexitarian</option>
                <option>Non-vegetarian</option>
              </select>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#254b36]/10 flex items-center justify-between text-xs">
            <span className="text-[#636c62]">Detailed dietary and allergen settings</span>
            <Link href="/onboarding" className="font-semibold text-[#254b36] hover:underline">
              Open onboarding preferences ↗
            </Link>
          </div>
        </section>

        {saveError && (
          <p role="alert" className={s.fieldError}>
            {saveError}
          </p>
        )}

        <div className={s.profileActions}>
          <span aria-live="polite">
            {dirty ? "You have unsaved changes" : "Your profile is up to date"}
          </span>
          <button
            type="button"
            className={s.secondary}
            disabled={!dirty}
            onClick={() => {
              setDraft(profile);
              setErrors({});
              setSaveError("");
            }}
          >
            Cancel
          </button>
          <button type="submit" className={s.primary} disabled={!dirty}>
            <Check size={17} aria-hidden="true" />
            Save changes
          </button>
        </div>

        {isAuthenticated && (
          <div className="pt-4 border-t border-[#254b36]/10 flex justify-end">
            <button
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-semibold text-[#90362c] hover:bg-[#fff2ed] px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-[#e4a8a4]"
            >
              <SignOut size={16} />
              {signingOut ? "Signing out…" : "Sign out of account"}
            </button>
          </div>
        )}
      </form>

      <aside className={s.planPanel} aria-labelledby="plan-title">
        <span className={s.eyebrow}>YOUR PLAN</span>
        <div className={s.planHeading}>
          <h2 id="plan-title">Carted Free</h2>
          <span className={s.demoBadge}>Sample plan</span>
        </div>
        <p>A little clarity for your everyday shopping.</p>
        <dl className={s.planDetails}>
          <div>
            <dt>Plan type</dt>
            <dd>Free</dd>
          </div>
          <div>
            <dt>Subscription</dt>
            <dd>No paid subscription</dd>
          </div>
        </dl>
        <div className={s.planNote}>
          <Leaf size={22} aria-hidden="true" />
          <p>
            You’re exploring Carted. Your account credentials and onboarding preferences are securely
            managed through FastAPI and Zustand.
          </p>
        </div>
      </aside>
    </div>
  );
}
