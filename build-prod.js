const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./src/main.ts"],
    bundle: true,
    outfile: "./dist/script.prod.user.js",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    legalComments: "none",
    banner: {
      js: `// ==UserScript==
// @name         Story Downloader - Facebook and Instagram
// @namespace    https://github.com/oscar370
// @version      2.0.6
// @description  Download stories (videos and images) from Facebook and Instagram.
// @author       oscar370
// @match        *.facebook.com/*
// @match        *.instagram.com/*
// @grant        none
// @license      GPL3
// ==/UserScript==
`,
    },
  })
  .catch(() => process.exit(1));
