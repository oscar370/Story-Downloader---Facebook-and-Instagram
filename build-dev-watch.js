require("dotenv").config();

const esbuild = require("esbuild");

const devRequirePath = process.env.DEV_REQUIRE_PATH || "";

const banner = `// ==UserScript==
// @name         Story Downloader - Facebook and Instagram - Dev
// @namespace    https://github.com/oscar370
// @version      0.0.0
// @description  Download stories (videos and images) from Facebook and Instagram.
// @author       oscar370
// @match        *.facebook.com/*
// @match        *.instagram.com/*
// @grant        none
// @license      GPL3
${devRequirePath ? `// @require     ${devRequirePath}` : ""}
// ==/UserScript==
`;

async function buildAndWatch() {
  const ctx = await esbuild.context({
    entryPoints: ["./src/main.ts"],
    bundle: true,
    outfile: "./dist/script.dev.user.js",
    banner: { js: banner },
    platform: "browser",
    legalComments: "none",
    define: { "process.env.NODE_ENV": '"development"' },
  });

  await ctx.watch();

  console.log("Waiting for changes...");
}

buildAndWatch().catch((e) => {
  console.error(e);
  process.exit(1);
});
