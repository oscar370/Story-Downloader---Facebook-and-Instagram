// ==UserScript==
// @name         Story Downloader - Facebook and Instagram
// @namespace    https://github.com/oscar370
// @version      2.0.1
// @description  Download stories (videos and images) from Facebook and Instagram.
// @author       oscar370
// @match        *.facebook.com/*
// @match        *.instagram.com/*
// @grant        none
// @license      GPL3
// ==/UserScript==

(function () {
  "use strict";

  const SAFETY_DELAY = 2000;

  class StoryDownloader {
    constructor() {
      this.mediaUrl = null;
      this.detectedVideo = null;
      this.init();
    }

    init() {
      this.setupMutationObserver();
    }

    setupMutationObserver() {
      const observer = new MutationObserver(() => {
        this.checkPageStructure();
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    get isFacebookPage() {
      return /(facebook)/.test(window.location.href);
    }

    checkPageStructure() {
      const btn = document.getElementById("downloadBtn");

      if (/(\/stories\/)/.test(window.location.href)) {
        this.injectGlobalStyles();
        setTimeout(() => this.createButton(), SAFETY_DELAY);
      } else if (btn) {
        btn.remove();
      }
    }

    injectGlobalStyles() {
      const style = document.createElement("style");

      style.textContent = `
      #downloadBtn {
        border: none;
        background: transparent;
        color: white;
        cursor: pointer;
        zIndex: 9999
      }
      `;

      document.head.appendChild(style);
    }

    createButton() {
      if (document.getElementById("downloadBtn")) return;

      const topBars = this.isFacebookPage
        ? Array.from(document.querySelectorAll("div.xtotuo0"))
        : Array.from(document.querySelectorAll("div.x1xmf6yo"));
      const topBar = topBars.find((bar) => bar.offsetHeight > 0);

      const btn = document.createElement("button");
      btn.id = "downloadBtn";
      btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-file-arrow-down-fill" viewBox="0 0 16 16">
        <path xmlns="http://www.w3.org/2000/svg" d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M8 5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5A.5.5 0 0 1 8 5"/>
      </svg>
      `;
      btn.addEventListener("click", () => this.handleDownload());

      topBar.appendChild(btn);
    }

    async handleDownload() {
      try {
        await this.detectMedia();

        if (!this.mediaUrl) throw new Error("No multimedia content was found");

        const filename = this.generateFileName();

        await this.downloadMedia(this.mediaUrl, filename);
      } catch (error) {
        console.log(error);
      }
    }

    async detectMedia() {
      return new Promise((resolve) => {
        const mediaDetector = () => {
          const video = this.findVideo();
          const image = this.findImage();

          if (video) {
            this.mediaUrl = video;
            resolve();
          } else if (image) {
            this.mediaUrl = image.src;
            resolve();
          }
        };
        mediaDetector();
      });
    }

    findVideo() {
      const videos = Array.from(document.querySelectorAll("video")).filter(
        (v) => v.offsetHeight > 0
      );

      if (videos.length !== 0) {
        for (const video of videos) {
          const videoUrl = this.searchVideoSource(video);
          if (videoUrl) {
            this.detectedVideo = true;
            return videoUrl;
          }
        }
      }

      return null;
    }

    searchVideoSource(video) {
      const reactFiberKey = Object.keys(video).find((key) =>
        key.startsWith("__reactFiber")
      );
      if (!reactFiberKey) return null;

      const reactKey = reactFiberKey.replace("__reactFiber", "");
      const parentElement =
        video.parentElement?.parentElement?.parentElement?.parentElement;
      const reactProps = parentElement?.[`__reactProps${reactKey}`];

      const implementations =
        reactProps?.children?.[0]?.props?.children?.props?.implementations ||
        reactProps?.children?.props?.children?.props?.implementations;

      let videoUrl = null;

      if (implementations) {
        for (const index of [1, 0, 2]) {
          const source = implementations[index]?.data;
          if (source) {
            videoUrl =
              source.hdSrc || source.sdSrc || source.hd_src || source.sd_src;
            if (videoUrl) break;
          }
        }
      }

      if (!videoUrl) {
        const videoData =
          video[reactFiberKey]?.return?.stateNode?.props?.videoData?.$1;
        videoUrl = videoData?.hd_src || videoData?.sd_src;
      }

      return videoUrl;
    }

    findImage() {
      const images = Array.from(document.querySelectorAll("img")).filter(
        (img) => img.offsetHeight > 0 && img.src.includes("cdn")
      );

      return images.find((img) => {
        const naturalSize = img.naturalWidth * img.naturalHeight;
        return naturalSize >= 500000;
      });
    }

    generateFileName() {
      const timestamp = new Date().toISOString().split("T")[0];
      const userNames = this.isFacebookPage
        ? Array.from(document.querySelectorAll("span")).filter(
            (e) => e.offsetWidth > 0 && e.offsetTop === -5
          )
        : Array.from(document.querySelectorAll(".x1i10hfl"));
      const userName = this.isFacebookPage
        ? userNames[userNames.length - 1].innerText || "uknown"
        : userNames
            .find((user) => user.offsetHeight > 0 && user.offsetHeight < 35)
            .pathname.replace(/\//g, "") || "uknown";
      const extension = this.detectedVideo ? "mp4" : "jpg";

      return `${userName}-${timestamp}.${extension}`;
    }

    async downloadMedia(url, filename) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Download error:", error);
      }
    }
  }

  new StoryDownloader();
})();
