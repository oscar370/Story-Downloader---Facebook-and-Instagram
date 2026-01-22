import { MAX_ATTEMPTS } from "./constants";
import { detectMedia, downloadMedia, generateFileName } from "./downloader";
import { getPlatformConfig, isFacebookPage, isMobile, log } from "./helpers";
import { getState, setState } from "./store";
import { $, $$, append, create, css, html, on } from "./utils";

const DOWNLOAD_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
  class="bi bi-file-arrow-down-fill" viewBox="0 0 16 16">
  <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2
    M8 5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 
    .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 
    .708-.708L7.5 9.293V5.5A.5.5 0 0 1 8 5"/>
</svg>
`;

const BUTTON_STYLES: Partial<CSSStyleDeclaration> = {
  position: "relative",
  border: "none",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  zIndex: "9999",
};

const CONTAINER_MOBILE_STYLES: Partial<CSSStyleDeclaration> = {
  position: "absolute",
  bottom: "70px",
  right: "20px",
};

export function createButtonWithPolling() {
  const isPolling = getState().isPolling;
  if (isPolling) return;
  setState({ isPolling: true });

  let attempts = 0;

  const poll = () => {
    const existingBtn = $("#downloadBtn");

    if (existingBtn) {
      setState({ isPolling: false });
      return;
    }

    const createdBtn = createButton();

    if (createdBtn || attempts >= MAX_ATTEMPTS) {
      setState({ isPolling: false });
      return;
    }

    attempts++;
    setTimeout(poll, 500);
  };

  poll();
}

function createButton(): HTMLButtonElement | null {
  // New FB layout requires a different approach to creation
  if (isFacebookPage() && isMobile()) {
    const container = create("div");
    css(container, CONTAINER_MOBILE_STYLES);

    const btn = create("button", { id: "downloadBtn" });
    html(btn, DOWNLOAD_ICON);
    css(btn, BUTTON_STYLES);
    on(btn, "click", () => handleDownload());

    append(container, btn);
    append(document.body, container);

    return btn;
  }

  const config = getPlatformConfig();
  const topBars = $$(config.topBar);

  const topBar = topBars.find(
    (bar): bar is HTMLElement =>
      bar instanceof HTMLElement && bar.offsetHeight > 0,
  );

  if (!topBar) {
    log("No suitable top bar found");
    return null;
  }

  const btn = create("button", { id: "downloadBtn" });
  html(btn, DOWNLOAD_ICON);
  css(btn, BUTTON_STYLES);
  on(btn, "click", () => handleDownload());
  append(topBar, btn);

  log("Download button added", btn);

  return btn;
}

async function handleDownload() {
  try {
    await detectMedia();
    const mediaUrl = getState().mediaUrl;
    if (!mediaUrl) throw new Error("No multimedia content was found");

    const filename = generateFileName();

    await downloadMedia(mediaUrl, filename);
  } catch (error) {
    log("Download failed:", error);
  }
}
