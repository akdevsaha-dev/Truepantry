export const goals = [
  {
    id: "protein",
    label: "High protein",
    verdict: "Good fit",
    note: "18 g of protein supports the goal you selected.",
  },
  {
    id: "sugar",
    label: "Less sugar",
    verdict: "Check the label",
    note: "Compare total and added sugars before choosing this one.",
  },
  {
    id: "budget",
    label: "Save money",
    verdict: "Compare sizes",
    note: "The larger tub may offer a better price per 100 g.",
  },
] as const;

export type Goal = (typeof goals)[number];
