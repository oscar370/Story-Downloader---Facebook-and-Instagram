// ==UserScript==
// @name         Story Downloader - Facebook and Instagram
// @namespace
// @version      1.1
// @description  Download stories (videos and images) from Facebook and Instagram.
// @author       oscar370
// @match        *.facebook.com/*
// @match        *.instagram.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const createDownloadButton = () => {
    // Initialization
    const button = document.createElement("button");
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    const currentUrl = window.location.href;
    let topBar;

    // Determines the location of the upper div
    if (currentUrl.includes("facebook")) {
      topBar = document.querySelector(
        ".x78zum5.xds687c.xw3qccf.x10l6tqk.xtotuo0"
      );
    } else {
      const topBars = document.querySelectorAll(".x6s0dn4.x78zum5.x1xmf6yo");
      topBar = Array.from(topBars).find((bar) => bar.clientHeight > 0);
    }

    // Button properties
    button.id = "downloadButton";
    Object.assign(button.style, {
      cursor: "pointer",
      border: "none",
      backgroundColor: "transparent",
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
    // Initialization
    const dateStr = new Date().toISOString().split("T")[0];
    const currentUrl = window.location.href;
    const userName = currentUrl.includes("facebook")
      ? document.querySelector(
          ".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1rg5ohu.x1a2a7pz.x193iq5w"
        ).innerText ?? "uknown"
      : document.querySelector(
          ".x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.xeuugli._a6hd"
        ).innerText ?? "uknown";
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
        console.log("Descarga del vídeo en curso");
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
      let images;
      let image;

      if (currentUrl.includes("facebook")) {
        images = document.querySelectorAll(
          ".xz74otr.xjbqb8w.x3x9cwd.x1o1ewxj.x17qophe.x10l6tqk.xwa60dl.x1cb1t30.xh8yej3.x1ja2u2z"
        );
        image = Array.from(images).find((img) => img.clientHeight > 0).src;
      } else {
        images = document.querySelectorAll(
          ".xl1xv1r.x5yr21d.xmz0i5r.x193iq5w.xh8yej3"
        );
        image = Array.from(images).find((img) => img.clientHeight > 0).src;
      }

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
        if (!visibleButton) {
          setTimeout(() => {
            createDownloadButton();
          }, 1000);
        }
      } else {
        if (visibleButton) {
          removeDownloadButton();
        }
      }
    }
  };

  checkURL();

  const observer = new MutationObserver(() => {
    checkURL();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
