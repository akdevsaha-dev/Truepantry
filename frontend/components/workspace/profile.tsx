'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Check, Leaf, SignOut, UserCircle } from '@phosphor-icons/react';
import { formatApiError, onboardingApi } from '@/lib/api';
import { diets, goals } from '@/lib/preferences';
import { useAuthStore, useOnboardingStore } from '@/lib/stores';
import { PageHeading } from './ui';
import { useWorkspace } from './workspace';
import s from './workspace.module.css';

export function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { profile, isLoading } = useOnboardingStore();

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  return (
    <>
      <PageHeading title="A little more you." description="Your details and preferences, all together." />
      <div className={s.profileLayout}>
        <div className={s.profileForm}>
          <section className={s.profilePanel}>
            <div className={s.sectionHeading}>
              <div>
                <h2>Personal information</h2>
                <p>The account you signed up with.</p>
              </div>
              <UserCircle size={24} aria-hidden="true" />
            </div>
            <div className={s.profileIdentity}>
              <span className={s.avatar} aria-hidden="true">
                {user?.username.charAt(0).toUpperCase()}
              </span>
              <div>
                <strong>{user?.username}</strong>
                <p>{user?.email}</p>
              </div>
            </div>
          </section>

          {isLoading ? (
            <p role="status">Loading your preferences…</p>
          ) : (
            // remount when the saved values change so the form starts from them
            <PreferencesForm key={`${profile.goal}-${profile.diet}-${profile.otherDiet}`} />
          )}
        </div>

        <aside className={s.planPanel}>
          <span className={s.eyebrow}>ACCOUNT</span>
          <p>Signed in as {user?.email}.</p>
          <button className={s.secondary} onClick={handleSignOut}>
            <SignOut size={16} />
            Sign out
          </button>
        </aside>
      </div>
    </>
  );
}

function PreferencesForm() {
  const { toast } = useWorkspace();
  const { profile, setField } = useOnboardingStore();
  const [goal, setGoal] = useState(profile.goal);
  const [diet, setDiet] = useState(profile.diet);
  const [otherDiet, setOtherDiet] = useState(profile.otherDiet);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const changed = goal !== profile.goal || diet !== profile.diet || otherDiet !== profile.otherDiet;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (diet === 'Other' && !otherDiet.trim()) {
      setError('Tell us your dietary preference.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onboardingApi.updateGoals({ goal });
      await onboardingApi.updatePreferences({ diet, other_diet: diet === 'Other' ? otherDiet.trim() : null });
      setField('goal', goal);
      setField('diet', diet);
      setField('otherDiet', diet === 'Other' ? otherDiet.trim() : '');
      toast('Preferences saved');
    } catch (err) {
      setError(formatApiError(err, 'Could not save your preferences.'));
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className={s.profilePanel}>
      <div className={s.sectionHeading}>
        <div>
          <h2>Shopping preferences</h2>
          <p>Every scan and recipe is checked against these.</p>
        </div>
        <Leaf size={22} aria-hidden="true" />
      </div>
      <div className={s.profileFields}>
        <div>
          <label htmlFor="profile-goal">My goal</label>
          <select id="profile-goal" value={goal} onChange={(e) => setGoal(e.target.value)}>
            {goals.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="profile-diet">Dietary preference</label>
          <select id="profile-diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
            {diets.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        {diet === 'Other' && (
          <div>
            <label htmlFor="profile-other-diet">Your dietary preference</label>
            <input
              id="profile-other-diet"
              value={otherDiet}
              maxLength={120}
              onChange={(e) => setOtherDiet(e.target.value)}
            />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className={s.fieldError}>
          {error}
        </p>
      )}

      <div className={s.profileActions}>
        <span aria-live="polite">{changed ? 'You have unsaved changes' : 'Your preferences are up to date'}</span>
        <button type="submit" className={s.primary} disabled={!changed || saving}>
          <Check size={17} aria-hidden="true" />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
