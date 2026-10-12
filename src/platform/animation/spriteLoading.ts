export type SpriteBank = { pose: string; key: string };
export type SpriteLoad = {
  request: SpriteBank;
  display: SpriteBank | null;
  status: "loading" | "ready" | "failed";
  firstReady: boolean;
};
export type SpriteLoadEvent =
  | { type: "request"; bank: SpriteBank }
  | { type: "first" | "ready" | "failed"; key: string };
export const initialSpriteLoad = (bank: SpriteBank): SpriteLoad => ({
  request: bank,
  display: null,
  status: "loading",
  firstReady: false,
});
export function spriteLoadReducer(
  state: SpriteLoad,
  event: SpriteLoadEvent,
): SpriteLoad {
  if (event.type === "request")
    return event.bank.key === state.request.key
      ? state
      : { ...state, request: event.bank, status: "loading", firstReady: false };
  if (event.key !== state.request.key) return state;
  if (event.type === "first") return { ...state, firstReady: true };
  // A failed generation only recovers through an explicit retry, never a late callback.
  if (state.status === "failed") return state;
  if (event.type === "failed") return { ...state, status: "failed" };
  return {
    ...state,
    status: "ready",
    firstReady: true,
    display: state.request,
  };
}
