import type { MainTab } from "../ui/BottomNav";
export type Page =
  | "home"
  | "picker"
  | "session"
  | "finish"
  | "reward"
  | "history"
  | "settings"
  | "wardrobe"
  | "room"
  | "weekly"
  | "quests"
  | "inventory"
  | "achievement";
export function resolvePage(
  page: Page,
  hasActive: boolean,
  hasReward: boolean,
): Page {
  if ((page === "session" || page === "finish") && !hasActive) return "home";
  if (page === "reward" && !hasReward) return "home";
  if (page === "picker" && hasActive) return "session";
  return page;
}
export const parentPage = (page: Page): Page =>
  (
    ({
      home: "home",
      picker: "home",
      session: "home",
      finish: "session",
      reward: "home",
      history: "weekly",
      settings: "home",
      wardrobe: "inventory",
      room: "inventory",
      weekly: "home",
      quests: "home",
      inventory: "home",
      achievement: "weekly",
    }) as const
  )[page];
export const selectedTab = (page: Page): MainTab =>
  page === "quests"
    ? "quests"
    : ["inventory", "room", "wardrobe"].includes(page)
      ? "inventory"
      : ["weekly", "history", "achievement"].includes(page)
        ? "weekly"
        : page === "settings"
          ? "settings"
          : "home";
export const showsDock = (page: Page) =>
  !["wardrobe", "room", "finish", "reward"].includes(page);
