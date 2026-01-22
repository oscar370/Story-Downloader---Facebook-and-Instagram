const esbuild = require("esbuild");

const isDev = process.env.NODE_ENV !== "production";

const ctx = esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2017",
  outfile: "dist/script.user.js",
  logLevel: "info",
  define: {
    __DEV__: JSON.stringify(isDev),
  },

  banner: {
    js: `// ==UserScript==
// @name         Story Downloader - Facebook and Instagram
// @namespace    https://github.com/oscar370
// @version      2.1.0
// @description  Download stories (videos and images) from Facebook and Instagram.
// @author       oscar370
// @match        *.facebook.com/*
// @match        *.instagram.com/*
// @grant        none
// @license      GPL3
// ==/UserScript==`,
  },
});

(async () => {
  await ctx;
  if (process.argv.includes("--watch")) {
    await (await ctx).watch();
    console.log("watch active");
  } else {
    await (await ctx).rebuild();
    process.exit(0);
  }
})();
