// ==UserScript==
// @name         Story Downloader - Facebook and Instagram
// @namespace    https://github.com/oscar370
// @version      1.3
// @description  Download stories (videos and images) from Facebook and Instagram.
// @author       oscar370
// @match        *.facebook.com/*
// @match        *.instagram.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  const createDownloadButton = () => {
    const button = document.createElement("button");
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    const currentUrl = window.location.href;
    const topBars = currentUrl.includes("facebook")
      ? Array.from(document.querySelectorAll("div.xtotuo0"))
      : Array.from(document.querySelectorAll("div.x1xmf6yo"));
    const topBar = topBars.find((bar) => bar.offsetHeight > 0);

    // Button properties
    button.id = "downloadButton";
    Object.assign(button.style, {
      border: "none",
      backgroundColor: "transparent",
      color: "white",
      cursor: "pointer",
      zIndex: "9999",
    });

    // Icon properties
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "24");
    icon.setAttribute("fill", "currentColor");
    icon.setAttribute("class", "bi bi-file-arrow-down-fill");
    icon.setAttribute("viewBox", "0 0 16 16");
    path1.setAttribute(
      "d",
      "M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M8 5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5A.5.5 0 0 1 8 5"
    );

    // Adding elements and events
    icon.appendChild(path1);
    button.appendChild(icon);
    topBar.appendChild(button);
    button.addEventListener("click", handleButtonClick);
  };

  const handleButtonClick = () => {
    const dateStr = new Date().toISOString().split("T")[0];
    const currentUrl = window.location.href;
    const userNames = currentUrl.includes("facebook")
      ? Array.from(document.querySelectorAll("span.x1s688f"))
      : Array.from(document.querySelectorAll("span.x10wlt62"));
    const userName = userNames.find((user) => user.offsetHeight > 0).innerText;
    const videos = document.querySelectorAll("video");
    let videoUrl = null;

    // Performs the video search
    for (const video of videos) {
      if (video.offsetHeight === 0) continue;

      let reactKey = "";
      const keys = Object.keys(video);

      for (const key of keys) {
        if (key.includes("__reactFiber")) {
          reactKey = key.split("__reactFiber")[1];
          break;
        }
      }
      videoUrl =
        video.parentElement.parentElement.parentElement.parentElement[
          `__reactProps${reactKey}`
        ]?.children[0]?.props?.children?.props?.implementations[1]?.data
          ?.hdSrc ||
        video.parentElement.parentElement.parentElement.parentElement[
          `__reactProps${reactKey}`
        ]?.children[0]?.props?.children?.props?.implementations[1]?.data
          ?.sdSrc ||
        video.parentElement.parentElement.parentElement.parentElement[
          `__reactProps${reactKey}`
        ]?.children?.props?.children?.props?.implementations[1]?.data?.hdSrc ||
        video.parentElement.parentElement.parentElement.parentElement[
          `__reactProps${reactKey}`
        ]?.children?.props?.children?.props?.implementations[1]?.data?.sdSrc ||
        video[`__reactFiber${reactKey}`]?.return?.stateNode?.props?.videoData
          ?.$1?.hd_src ||
        video[`__reactFiber${reactKey}`]?.return?.stateNode?.props?.videoData
          ?.$1?.sd_src;
      if (videoUrl) break;
    }

    const videoDownload = async () => {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${userName}-${dateStr}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading video:", error);
      }
    };

    const imageDownload = async () => {
      const images = currentUrl.includes("facebook")
        ? Array.from(document.querySelectorAll("img"))
        : Array.from(document.querySelectorAll("img.xmz0i5r"));
      const image = images.find((img) => img.offsetHeight > 0).src;

      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${userName}-${dateStr}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    };

    videoUrl ? videoDownload() : imageDownload();
  };

  const removeDownloadButton = () => {
    const button = document.querySelector("#downloadButton");
    button && document.body.removeChild(button);
  };

  // URL Monitoring
  let previousPath = window.location.pathname;

  const checkURL = () => {
    const currentPath = window.location.pathname;
    if (currentPath !== previousPath) {
      previousPath = currentPath;
      const visibleButton = document.querySelector("#downloadButton");

      if (currentPath.includes("/stories/")) {
        !visibleButton && setTimeout(() => createDownloadButton(), 1000);
      } else {
        visibleButton && removeDownloadButton();
      }
    }
  };

  checkURL();

  const observer = new MutationObserver(() => {
    checkURL();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
