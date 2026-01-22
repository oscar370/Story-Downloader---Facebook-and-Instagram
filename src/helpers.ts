import { SELECTORS } from "./constants";
import { $$ } from "./utils";

declare const __DEV__: boolean;

const isDev = __DEV__;

export function log(...args: any[]) {
  if (isDev) console.log("[StoryDownloader]", ...args);
}

export function isMobile() {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobileUA = /android|iphone|kindle|ipad|playbook|silk/i.test(
    userAgent,
  );

  return isMobileUA;
}

export function isFacebookPage() {
  return /(facebook)/.test(window.location.href);
}

export function getPlatformConfig() {
  const platform = isFacebookPage() ? "facebook" : "instagram";

  return SELECTORS[platform];
}

export function getFbMobileProfileNodes() {
  const nameSpans = $$(
    "div[data-mcomponent='ServerTextArea']  span",
  ) as HTMLElement[];

  const nameSpan = nameSpans.find(
    (el) => el.offsetHeight > 0 && el.closest("[role='button']"),
  );

  if (!nameSpan) return null;

  return { nameSpan };
}
