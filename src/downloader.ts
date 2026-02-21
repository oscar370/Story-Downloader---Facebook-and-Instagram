import {
  getFbMobileProfileNodes,
  getPlatformConfig,
  isFacebookPage,
  isMobile,
  log,
} from "./helpers";
import { getState, setState } from "./store";
import { $$, append, create, remove, text } from "./utils";

type Fiber = {
  stateNode: HTMLElement | Text | null;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  memoizedProps: any;
  pendingProps: any;
};

export async function detectMedia() {
  const video = findVideo();
  const image = findImage();

  if (video) {
    setState({ mediaUrl: video, detectedVideo: true });
  } else if (image) {
    setState({ mediaUrl: image.src, detectedVideo: false });
  }

  log("Media URL detected:", getState().mediaUrl);
}

function findVideo() {
  const videos = ($$("video") as HTMLVideoElement[]).filter(
    (v) => v.offsetHeight > 0,
  );

  log("Video elements: ", videos);

  for (const video of videos) {
    const url = searchVideoSource(video);

    if (url) {
      return url;
    }
  }
  return null;
}

/**
 * Utility to extract the original source URL from a video element that uses a blob URL.
 * Works by traversing the React internal fiber tree to find component props containing
 * the original video URLs (hd_src, sd_src, etc.).
 *
 * This is a fragile approach that depends on React's internal structure and Facebook's
 * specific prop names. It may break with future React or Facebook updates.
 */
function searchVideoSource(video: HTMLVideoElement): string | null {
  if (!video.currentSrc.startsWith("blob")) {
    return video.currentSrc;
  }

  // 1. Locate the React root container (an element with __reactContainer$...)
  const rootElement = findReactRoot();
  if (!rootElement) return null;

  // 2. Get the root fiber (either __reactContainer or __reactFiber)
  const rootFiberKey = Object.keys(rootElement).find(
    (key) =>
      key.startsWith("__reactContainer") || key.startsWith("__reactFiber"),
  );
  if (!rootFiberKey) return null;
  const rootFiber = (rootElement as any)[rootFiberKey] as Fiber;

  // 3. Find the fiber corresponding to the given <video> element.
  const videoFiber = findFiberForElement(rootFiber, video);
  if (!videoFiber) return null;

  // 4. Walk up the .return chain (parent components) looking for props that contain video URLs.
  let fiber: Fiber | null = videoFiber.return;
  while (fiber) {
    // Check both memoizedProps (committed) and pendingProps (in-progress)
    const props = fiber.memoizedProps || fiber.pendingProps;
    if (props) {
      const url = findVideoUrlInProps(props);
      if (url) return url;
    }
    fiber = fiber.return;
  }

  return null;
}

/**
 * Finds an element in the DOM that has a __reactContainer$... property.
 * This is the root of a React application (or a root inside a portal).
 */
function findReactRoot(): HTMLElement | null {
  // First, search only within <body> – this is faster and covers most cases.
  const bodyElements = document.querySelectorAll("body *");
  for (const el of bodyElements) {
    if (Object.keys(el).some((key) => key.startsWith("__reactContainer"))) {
      return el as HTMLElement;
    }
  }
  // If not found, fallback to searching the entire document (for edge cases).
  const allElements = document.querySelectorAll("*");
  for (const el of allElements) {
    if (Object.keys(el).some((key) => key.startsWith("__reactContainer"))) {
      return el as HTMLElement;
    }
  }
  return null;
}

/**
 * Depth-first search to find the fiber node whose stateNode matches the target DOM element.
 */
function findFiberForElement(
  rootFiber: Fiber,
  target: HTMLElement,
): Fiber | null {
  let found: Fiber | null = null;

  function dfs(fiber: Fiber | null): void {
    if (!fiber || found) return;

    // If this fiber's stateNode is exactly the target element, we've found it.
    if (fiber.stateNode === target) {
      found = fiber;
      return;
    }

    // Recurse into children and then siblings.
    if (fiber.child) dfs(fiber.child);
    if (fiber.sibling) dfs(fiber.sibling);
  }

  dfs(rootFiber);
  return found;
}

/**
 * Recursively searches an object (typically props or state) for any property
 * that looks like a video URL (starts with http/https) and matches known keys.
 */
function findVideoUrlInProps(
  obj: any,
  visited: Set<any> = new Set(),
): string | null {
  if (!obj || typeof obj !== "object" || visited.has(obj)) return null;
  visited.add(obj);

  // Common property names used by Facebook/Instagram to store video URLs.
  const urlProps = [
    "hd_src",
    "sd_src",
    "hdSrc",
    "sdSrc",
    "playable_url",
    "browser_native_hd_url",
    "browser_native_sd_url",
    "progressive_url",
    "src",
    "url",
    "videoUrl",
  ];

  // Check direct properties first.
  for (const prop of urlProps) {
    try {
      const value = obj[prop];
      if (typeof value === "string" && value.startsWith("http")) {
        return value;
      }
    } catch {
      // Ignore access errors (e.g., if prop is a symbol).
    }
  }

  // Recursively traverse nested objects and arrays.
  for (const key in obj) {
    try {
      const value = obj[key];
      if (value && typeof value === "object") {
        const result = findVideoUrlInProps(value, visited);
        if (result) return result;
      }
    } catch {
      // Ignore access errors.
    }
  }

  return null;
}

function findImage(): HTMLImageElement | null {
  const images = ($$("img") as HTMLImageElement[]).filter(
    (img) => img.offsetHeight > 0 && img.src.includes("cdn"),
  );

  return images.find((img) => img.height > 400) || null;
}

export function generateFileName(): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const config = getPlatformConfig();
  const isFb = isFacebookPage();
  const detectedVideo = getState().detectedVideo;
  let userName = "unknown";

  const user = $$(config.userName).find((e) => {
    if (!(e instanceof HTMLElement)) return false;

    // Facebook check
    if (isFb && !isMobile()) {
      return e.offsetWidth > 0;
    }

    // Instagram check
    return e.offsetHeight > 0 && e.offsetHeight < 35;
  });

  if (user) {
    log(`Element with the username:`);
    log(user);

    if (isFb) {
      userName = text(user) || userName;
    } else {
      userName =
        (user as HTMLAnchorElement).pathname.replace(/\//g, "") || userName;
    }
  } else if (isMobile()) {
    // Mobile fallback
    if (isFb) {
      const nameSpan = getFbMobileProfileNodes()?.nameSpan;
      log(`Element with the username:`);
      log(nameSpan);

      if (nameSpan) {
        userName = nameSpan.textContent;
      }
    }
  }

  const extension = detectedVideo ? "mp4" : "jpg";
  return `${userName}-${timestamp}.${extension}`;
}

export async function downloadMedia(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const link = create("a", {
      href: URL.createObjectURL(blob),
      download: filename,
    });

    append(document.body, link);
    link.click();
    remove(link);

    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download error:", error);
  }
}
