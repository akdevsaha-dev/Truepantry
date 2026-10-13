"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useAuthStore, useOnboardingStore, type OnboardingFormField } from "@/lib/stores";
import styles from "./onboarding.module.css";

type Errors = Partial<Record<OnboardingFormField, string>>;

const steps = [
  { label: "About you", icon: "person" },
  { label: "Your goal", icon: "target" },
  { label: "Your plate", icon: "plate" },
];

const goals = [
  ["balance", "Eat more balanced", "A little more variety. A little more goodness."],
  ["energy", "Feel more energized", "Find food that keeps up with your everyday."],
  ["weight", "Manage my weight", "Make more intentional choices, at my own pace."],
];

const allergens = [
  "Milk",
  "Eggs",
  "Peanuts",
  "Tree nuts",
  "Soy",
  "Wheat",
  "Fish",
  "Shellfish",
  "Sesame",
  "Other",
  "None",
];

const diets = [
  "Vegetarian",
  "Non-vegetarian",
  "Vegan",
  "Pescatarian",
  "Flexitarian",
  "No preference",
  "Other",
];

const titles = [
  "Good choices start with you.",
  "What feels like progress?",
  "Your plate. Your preferences.",
];

const descriptions = [
  "A few little details to make your Carted experience feel a lot more you.",
  "Pick the goal that matters most right now. There’s no perfect answer.",
  "Tell us what you enjoy, and what needs to stay out of your cart.",
];

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    leaf: (
      <>
        <path d="M20 3C9 2 3 8 5 15s16 5 15-12Z" />
        <path d="M4 21 15 10" />
      </>
    ),
    balance: (
      <>
        <path d="M4 7h16M12 3v17M7 7l-4 8h8L7 7Zm10 0-4 8h8l-4-8ZM8 21h8" />
      </>
    ),
    energy: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
    weight: (
      <>
        <rect x="4" y="4" width="16" height="17" rx="4" />
        <path d="M8 8a6 6 0 0 1 8 0m-4-1 2 4" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="m14.5 9.5 5-5m0 0v3.5m0-3.5H16" />
      </>
    ),
    plate: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M3 4v5c0 1.7 1 3 2.5 3S8 10.7 8 9V4M5.5 4v16M19 4c-2 1.4-3 3.5-3 6h3v10" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.leaf}
    </svg>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const {
    step,
    direction,
    profile,
    isCompleted,
    isLoading,
    isSaving,
    error: apiError,
    fetchStatus,
    setField,
    toggleAllergen,
    goToStep,
    saveProfileStep,
    saveGoalStep,
    savePreferencesStep,
    completeOnboarding,
    clearError,
  } = useOnboardingStore();

  const [localErrors, setLocalErrors] = useState<Errors>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    checkAuth().finally(() => {
      fetchStatus();
    });
  }, [checkAuth, fetchStatus]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [step]);

  function update<K extends OnboardingFormField>(key: K, value: (typeof profile)[K]) {
    setField(key, value);
    setLocalErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleGoTo(targetStep: number) {
    clearError();
    setLocalErrors({});
    goToStep(targetStep);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isSaving) return;

    clearError();
    const next: Errors = {};

    if (step === 0) {
      const date = new Date(`${profile.dob}T00:00:00`);
      const oldest = new Date();
      oldest.setFullYear(oldest.getFullYear() - 120);

      if (!profile.dob || Number.isNaN(date.getTime()) || date > new Date() || date < oldest) {
        next.dob = "Enter a valid date of birth within the last 120 years.";
      }
      if (
        !profile.height ||
        !Number.isFinite(Number(profile.height)) ||
        Number(profile.height) < 50 ||
        Number(profile.height) > 250
      ) {
        next.height = "Enter a height between 50 and 250 cm.";
      }
      if (!profile.gender) {
        next.gender = "Choose an option, or select Prefer not to say.";
      }
    }

    if (step === 1 && !profile.goal) {
      next.goal = "Choose the goal that feels right for you.";
    }

    if (step === 2) {
      if (!profile.diet) {
        next.diet = "Choose a dietary preference.";
      }
      if (profile.diet === "Other" && !profile.otherDiet.trim()) {
        next.otherDiet = "Tell us your dietary preference.";
      }
      if (!profile.allergies.length) {
        next.allergies = "Select any allergies, or choose None.";
      }
      if (profile.allergies.includes("Other") && !profile.otherAllergy.trim()) {
        next.otherAllergy = "Tell us which other allergies to include.";
      }
    }

    setLocalErrors(next);
    const first = Object.keys(next)[0] as OnboardingFormField | undefined;
    if (first) {
      requestAnimationFrame(() => {
        form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      });
      return;
    }

    if (step === 0) {
      await saveProfileStep();
    } else if (step === 1) {
      await saveGoalStep();
    } else if (step === 2) {
      await savePreferencesStep();
    }
  }

  async function handleFinalComplete() {
    try {
      const redirectPath = await completeOnboarding();
      router.push(redirectPath);
    } catch {
      // Error handled in store and displayed in banner
    }
  }

  const fieldProps = (key: OnboardingFormField) => ({
    "aria-invalid": Boolean(localErrors[key]),
    "aria-describedby": localErrors[key] ? `${key}-error` : undefined,
  });

  const renderError = (key: OnboardingFormField) =>
    localErrors[key] ? (
      <p className={styles.error} id={`${key}-error`} role="alert">
        {localErrors[key]}
      </p>
    ) : null;

  const chosenGoal = goals.find((goal) => goal[0] === profile.goal);
  const isSummaryStep = step >= 3;

  return (
    <main
      className={styles.shell}
      id="main-content"
      data-step={isSummaryStep ? 3 : step}
    >
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={styles.glowOne} />
        <span className={styles.glowTwo} />
        <svg className={styles.waveTop} viewBox="0 0 1440 420" preserveAspectRatio="none">
          <path d="M-80 244C166 110 341 368 604 224C820 106 1031 92 1191 207C1318 299 1448 227 1530 142V-40H-80Z" />
        </svg>
        <svg className={styles.waveBottom} viewBox="0 0 1440 470" preserveAspectRatio="none">
          <path d="M-100 303C91 185 290 187 457 309C666 462 878 265 1066 310C1253 355 1359 435 1540 250V510H-100Z" />
        </svg>
        <span className={styles.ringOne} />
        <span className={styles.ringTwo} />
        <span className={styles.grain} />
      </div>

      <section className={styles.left}>
        <header className={styles.header}>
          <BrandLogo />

          <div className="flex items-center gap-3 text-xs">
            {isAuthenticated && user ? (
              <span className="rounded-full bg-white/70 px-3 py-1 font-medium text-[#254b36]">
                Signed in as @{user.username}
              </span>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-full border border-[#254b36]/20 bg-white/60 px-3 py-1 font-medium text-[#254b36] transition-colors hover:bg-white"
              >
                Sign in to save progress ↗
              </Link>
            )}
          </div>
        </header>

        <div className={styles.formArea}>
          <nav className={styles.progress} aria-label="Onboarding progress">
            {steps.map(({ label, icon }, index) => {
              const isCurrent = !isSummaryStep && step === index;
              const isDone = index < step || isSummaryStep;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={index > step && !isSummaryStep}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${label}${isCurrent ? ", current step" : isDone ? ", completed" : ""}`}
                  data-done={isDone}
                  onClick={() => handleGoTo(index)}
                >
                  <span className={styles.stepIcon}>
                    {isDone ? <Icon name="check" size={16} /> : <Icon name={icon} size={18} />}
                  </span>
                  <span className={styles.stepLabel}>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className={styles.progressTrack} aria-hidden="true">
            <span
              style={{
                transform: `scaleX(${isSummaryStep ? 1 : (step + 1) / 3})`,
              }}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-[#636c62]">
              <span
                className="mb-3 size-6 animate-spin rounded-full border-2 border-[#254b36]/30 border-t-[#254b36]"
                aria-hidden="true"
              />
              Loading your preferences…
            </div>
          ) : (
            <div key={isSummaryStep ? "complete" : step} className={styles.step} data-direction={direction}>
              {apiError && (
                <div
                  className="mb-6 rounded-xl border border-[#e4a8a4] bg-[#fff2ed] p-3.5 text-xs leading-relaxed text-[#90362c]"
                  role="alert"
                >
                  <strong>Notice:</strong> {apiError}
                  {!isAuthenticated && (
                    <div className="mt-2 font-medium">
                      <Link href="/sign-in" className="underline hover:text-[#254b36]">
                        Sign in
                      </Link>{" "}
                      or{" "}
                      <Link href="/sign-up" className="underline hover:text-[#254b36]">
                        create an account
                      </Link>{" "}
                      to save your profile to the backend.
                    </div>
                  )}
                </div>
              )}

              {isSummaryStep ? (
                <>
                  <div className={styles.successIcon}>
                    <Icon name="check" size={32} />
                  </div>
                  <p className={styles.eyebrow}>
                    {isCompleted ? "ONBOARDING COMPLETED" : "A LITTLE MORE YOU"}
                  </p>
                  <h1 ref={heading} tabIndex={-1}>
                    Looking good.
                    <br />
                    Feeling like you.
                  </h1>
                  <p className={styles.description}>
                    Here’s your starting point for a more personal shop. Take a look and make it yours.
                  </p>

                  <dl className={styles.summary}>
                    {[
                      [
                        "Date of birth",
                        profile.dob
                          ? new Date(`${profile.dob}T00:00:00`).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not provided",
                      ],
                      ["Height", profile.height ? `${profile.height} cm` : "Not provided"],
                      ["Gender", profile.gender || "Not specified"],
                      ["Your goal", chosenGoal ? chosenGoal[1] : profile.goal || "Not selected"],
                      [
                        "Dietary preference",
                        profile.diet === "Other" ? profile.otherDiet : profile.diet || "None",
                      ],
                      [
                        "Allergies",
                        profile.allergies.length > 0
                          ? profile.allergies
                              .map((val) => (val === "Other" ? profile.otherAllergy : val))
                              .join(", ")
                          : "None",
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-7 flex flex-col gap-3">
                    <button
                      className={styles.primary}
                      disabled={isSaving}
                      onClick={handleFinalComplete}
                      type="button"
                    >
                      {isSaving ? (
                        <>
                          <span
                            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            aria-hidden="true"
                          />
                          Saving to account…
                        </>
                      ) : (
                        <>
                          {isCompleted ? "Return to dashboard" : "Complete setup & Go to dashboard"}
                          <Icon name="arrow" size={18} />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#d5d8d1] bg-white text-xs font-semibold text-[#686c67] transition hover:bg-[#f5f7f3] hover:text-[#171717]"
                      onClick={() => handleGoTo(0)}
                    >
                      Edit preferences
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 ref={heading} tabIndex={-1}>
                    {titles[step]}
                  </h1>
                  <p className={styles.description}>{descriptions[step]}</p>

                  <form ref={form} onSubmit={submit} noValidate>
                    {step === 0 && (
                      <div className={styles.fields}>
                        <div className={styles.twoColumns}>
                          <div className={styles.field}>
                            <label htmlFor="dob">Date of birth</label>
                            <input
                              id="dob"
                              name="dob"
                              type="date"
                              autoComplete="bday"
                              required
                              value={profile.dob}
                              onChange={(event) => update("dob", event.target.value)}
                              {...fieldProps("dob")}
                            />
                            {renderError("dob")}
                          </div>

                          <div className={styles.field}>
                            <label htmlFor="height">Height</label>
                            <div className={styles.unitField}>
                              <input
                                id="height"
                                name="height"
                                type="number"
                                inputMode="decimal"
                                min="50"
                                max="250"
                                step="0.1"
                                placeholder="170"
                                required
                                value={profile.height}
                                onChange={(event) => update("height", event.target.value)}
                                {...fieldProps("height")}
                              />
                              <span>cm</span>
                            </div>
                            {renderError("height")}
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label htmlFor="gender">Gender</label>
                          <select
                            id="gender"
                            name="gender"
                            autoComplete="sex"
                            required
                            value={profile.gender}
                            onChange={(event) => update("gender", event.target.value)}
                            {...fieldProps("gender")}
                          >
                            <option value="" disabled>
                              Select your gender
                            </option>
                            {["Woman", "Man", "Prefer not to say"].map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                          {renderError("gender")}
                        </div>

                        <div className={styles.note}>
                          <Icon name="leaf" size={20} />
                          <p>
                            Every body is different.
                            <br />
                            <span>This is just a starting point, never a label.</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <fieldset className={styles.goals} {...fieldProps("goal")}>
                        <legend className={styles.srOnly}>Choose your primary goal</legend>
                        {goals.map(([val, title, detail]) => (
                          <label
                            key={val}
                            className={styles.goal}
                            data-selected={profile.goal === val}
                          >
                            <input
                              type="radio"
                              name="goal"
                              value={val}
                              checked={profile.goal === val}
                              onChange={() => update("goal", val)}
                              {...fieldProps("goal")}
                            />
                            <span className={styles.goalIcon}>
                              <Icon name={val} />
                            </span>
                            <span className={styles.goalText}>
                              <strong>{title}</strong>
                              <span>{detail}</span>
                            </span>
                            <span className={styles.radio} aria-hidden="true">
                              {profile.goal === val && <Icon name="check" size={12} />}
                            </span>
                          </label>
                        ))}
                        {renderError("goal")}
                      </fieldset>
                    )}

                    {step === 2 && (
                      <div className={styles.fields}>
                        <div className={styles.field}>
                          <label htmlFor="diet">Dietary preference</label>
                          <select
                            id="diet"
                            name="diet"
                            required
                            value={profile.diet}
                            onChange={(event) => update("diet", event.target.value)}
                            {...fieldProps("diet")}
                          >
                            <option value="" disabled>
                              How do you like to eat?
                            </option>
                            {diets.map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                          {renderError("diet")}
                        </div>

                        {profile.diet === "Other" && (
                          <div className={styles.field}>
                            <label htmlFor="otherDiet">Your dietary preference</label>
                            <input
                              id="otherDiet"
                              name="otherDiet"
                              placeholder="Tell us what works for you"
                              maxLength={120}
                              value={profile.otherDiet}
                              onChange={(event) => update("otherDiet", event.target.value)}
                              {...fieldProps("otherDiet")}
                            />
                            {renderError("otherDiet")}
                          </div>
                        )}

                        <fieldset className={styles.allergies}>
                          <legend>Any food allergies?</legend>
                          <p>Select all that apply.</p>
                          <div className={styles.chips}>
                            {allergens.map((val) => (
                              <label
                                key={val}
                                className={styles.chip}
                                data-selected={profile.allergies.includes(val)}
                              >
                                <input
                                type="checkbox"
                                name="allergies"
                                value={val}
                                checked={profile.allergies.includes(val)}
                                onChange={() => toggleAllergen(val)}
                                {...fieldProps("allergies")}
                              />
                                <span aria-hidden="true">
                                  {profile.allergies.includes(val) ? (
                                    <Icon name="check" size={14} />
                                  ) : (
                                    "+"
                                  )}
                                </span>
                                {val === "None" ? "None of these" : val}
                              </label>
                            ))}
                          </div>
                          {renderError("allergies")}
                        </fieldset>

                        {profile.allergies.includes("Other") && (
                          <div className={styles.field}>
                            <label htmlFor="otherAllergy">Other food allergies</label>
                            <input
                              id="otherAllergy"
                              name="otherAllergy"
                              placeholder="e.g. Mustard, celery"
                              maxLength={200}
                              value={profile.otherAllergy}
                              onChange={(event) => update("otherAllergy", event.target.value)}
                              {...fieldProps("otherAllergy")}
                            />
                            {renderError("otherAllergy")}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={styles.actions}>
                      <button type="submit" className={styles.primary} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <span
                              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                              aria-hidden="true"
                            />
                            Saving step…
                          </>
                        ) : (
                          <>
                            {step === 2 ? "Review my preferences" : "Continue"}
                            <Icon name="arrow" size={19} />
                          </>
                        )}
                      </button>
                    </div>

                    {step > 0 && (
                      <p className={styles.stepHint}>
                        {step === 1
                          ? "Small steps count. You can change this later."
                          : "One last step to make it personal."}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <Icon name="lock" size={13} />
          <span>Your preferences are encrypted and securely linked to your account.</span>
        </footer>
      </section>
    </main>
  );
}
