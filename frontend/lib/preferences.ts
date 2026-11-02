// Shared by onboarding and the profile page. The goal keys must match the backend.
export const goals = [
  ["balance", "Eat more balanced", "A little more variety. A little more goodness."],
  ["energy", "Feel more energized", "Find food that keeps up with your everyday."],
  ["weight", "Manage my weight", "Make more intentional choices, at my own pace."],
];

export const diets = ["Vegetarian", "Non-vegetarian", "Vegan", "Pescatarian", "Flexitarian", "No preference", "Other"];

export function goalLabel(goal: string) {
  return goals.find(([key]) => key === goal)?.[1] ?? "Not set yet";
}
