export const categories = ["Life", "Love", "Career", "Money", "Health", "Fun", "Other"] as const;

export type Category = (typeof categories)[number];
