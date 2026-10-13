"use client";

import { useState } from "react";

import { goals, type Goal } from "@/lib/landing-data";

export function ScanDemo() {
  const [selectedGoal, setSelectedGoal] = useState<Goal>(goals[0]);

  return (
    <div
      className="w-full max-w-[39rem] rounded-xl border border-line bg-surface-raised p-[clamp(1rem,2vw,1.5rem)] shadow-soft"
      role="group"
      aria-label="Interactive Carted product concept"
    >
      <div className="flex items-center justify-between gap-4 pb-4 font-mono text-[0.7rem] font-normal text-ink-soft uppercase">
        <span>Example scan</span>
        <span className="rounded-lg bg-surface-soft px-3 py-2 text-ink">
          Product matched
        </span>
      </div>

      <div className="grid grid-cols-[5.5rem_1fr] items-center gap-4 rounded-xl bg-surface-soft p-5 min-[481px]:grid-cols-[7rem_1fr] min-[481px]:gap-5">
        <div
          className="flex aspect-[0.86] -rotate-3 flex-col items-center justify-center rounded-[2.4rem_2.4rem_1rem_1rem] border border-[#d9d4f5] bg-[linear-gradient(155deg,#e9e6fb,var(--surface-raised))] text-[#22202e]"
          aria-hidden="true"
        >
          <span className="text-[1.8rem] font-extrabold tracking-[-0.07em]">18g</span>
          <small className="text-[0.64rem] font-bold">protein</small>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-ink-soft">Dairy</p>
          <h3 className="text-[clamp(1.35rem,2.3vw,2rem)] tracking-[-0.05em]">
            Plain Greek yogurt
          </h3>
          <p className="mt-2.5 text-sm leading-[1.4] text-ink-soft">
            Variant and nutrition verified
          </p>
        </div>
      </div>

      <div className="pt-6 pb-4">
        <p className="mb-3 font-mono text-[0.7rem] font-normal text-ink-soft uppercase">
          Choose a shopping goal
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Shopping goal">
          {goals.map((goal) => (
            <button
              className={`min-h-11 cursor-pointer rounded-lg border px-3.5 py-2.5 text-xs font-bold transition-[background-color,color,border-color] duration-150 ${
                goal.id === selectedGoal.id
                  ? "border-ink bg-ink !text-white"
                  : "border-line bg-transparent text-ink-soft hover:border-ink-soft hover:text-ink"
              }`}
              key={goal.id}
              type="button"
              aria-pressed={goal.id === selectedGoal.id}
              onClick={() => setSelectedGoal(goal)}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid items-start gap-3 rounded-xl bg-ink p-5 text-white min-[481px]:grid-cols-[minmax(7rem,0.7fr)_minmax(0,1.3fr)] min-[481px]:gap-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="grid gap-2">
          <span className="text-[0.68rem] font-bold">Carted says</span>
          <strong className="text-[1.1rem] tracking-[-0.035em]">
            {selectedGoal.verdict}
          </strong>
        </div>
        <p className="text-sm leading-[1.5]">{selectedGoal.note}</p>
      </div>
    </div>
  );
}
