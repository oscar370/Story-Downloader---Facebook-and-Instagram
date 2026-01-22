"use strict";

import { createButtonWithPolling } from "./dom";
import { log } from "./helpers";
import { getState, setState } from "./store";
import { $, remove } from "./utils";

log("Initializing observer...");
setupMutationObserver();

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    const hasRelevantChanges = mutations.some(
      (m) => m.addedNodes.length > 0 || m.removedNodes.length > 0,
    );

    if (!hasRelevantChanges) return;

    const observerTimeout = getState().observerTimeout;

    if (observerTimeout) clearTimeout(observerTimeout);

    const timeout = setTimeout(() => {
      checkPageStructure();
    }, 300);

    setState({ observerTimeout: timeout });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function checkPageStructure() {
  const lastUrl = getState().lastUrl;
  const currentUrl = window.location.href;
  const isStoryPage = /(\/stories\/)/.test(currentUrl);
  const btn = $("#downloadBtn");

  if (!isStoryPage) {
    if (btn) remove(btn);
    return;
  }

  if (currentUrl !== lastUrl || !btn) {
    setState({ lastUrl: currentUrl });
    createButtonWithPolling();
  }
}
