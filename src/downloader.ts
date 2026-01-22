import {
  getFbMobileProfileNodes,
  getPlatformConfig,
  isFacebookPage,
  isMobile,
  log,
} from "./helpers";
import { getState, setState } from "./store";
import { $$, append, create, remove, text } from "./utils";

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

  for (const video of videos) {
    const url = searchVideoSource(video);
    if (url) {
      return url;
    }
  }
  return null;
}

function searchVideoSource(video: HTMLVideoElement): string | null {
  if (!video.currentSrc.startsWith("blob")) {
    return video.currentSrc;
  }

  const reactFiberKey = Object.keys(video).find((key) =>
    key.startsWith("__reactFiber"),
  );
  if (!reactFiberKey) return null;

  const reactKey = reactFiberKey.replace("__reactFiber", "");
  const parent =
    video.parentElement?.parentElement?.parentElement?.parentElement;

  const reactProps = (parent as Record<string, any>)?.[
    `__reactProps${reactKey}`
  ];

  const implementations =
    reactProps?.children?.[0]?.props?.children?.props?.implementations ??
    reactProps?.children?.props?.children?.props?.implementations;

  if (implementations) {
    for (const index of [1, 0, 2]) {
      const source = implementations[index]?.data;
      const url =
        source?.hdSrc || source?.sdSrc || source?.hd_src || source?.sd_src;
      if (url) return url;
    }
  }

  const videoData = (video as any)[reactFiberKey]?.return?.stateNode?.props
    ?.videoData?.$1;
  return videoData?.hd_src || videoData?.sd_src || null;
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
