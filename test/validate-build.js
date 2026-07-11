#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const VERSION = require(path.join(ROOT, "package.json")).version;
const required = [
  "chromium/manifest.json",
  "chromium/assets/runtime.page.js",
  "chromium/assets/bridge.js",
  "chromium/popup.html",
  "firefox/manifest.json",
  "firefox/assets/runtime.page.js",
  "firefox/assets/bridge.js",
  "firefox/assets/firefox-injector.js",
  "firefox/options.html",
  "userscript/soft98-pro.user.js",
  `packages/soft98-pro-chromium-${VERSION}.zip`,
  `packages/soft98-pro-firefox-${VERSION}.zip`,
  `packages/soft98-pro-userscript-${VERSION}.zip`,
];

for (const file of required) {
  const target = path.join(DIST, file);
  if (!fs.existsSync(target)) throw new Error(`Missing build artifact: ${file}`);
}

const chromium = JSON.parse(fs.readFileSync(path.join(DIST, "chromium", "manifest.json"), "utf8"));
const firefox = JSON.parse(fs.readFileSync(path.join(DIST, "firefox", "manifest.json"), "utf8"));
if (chromium.manifest_version !== 3) throw new Error("Chromium manifest must be MV3");
if (firefox.manifest_version !== 2) throw new Error("Firefox manifest must be MV2");
if (!chromium.content_scripts.some((entry) => entry.world === "MAIN")) {
  throw new Error("Chromium build must run the page runtime in MAIN world");
}

const runtime = fs.readFileSync(path.join(DIST, "chromium", "assets", "runtime.page.js"), "utf8");
const userscript = fs.readFileSync(path.join(ROOT, "soft98-pro.user.js"), "utf8");
for (const needle of ["fbd", "abdd", "error_abdd", "fbd--compiled"]) {
  if (runtime.includes(needle)) throw new Error(`Fragile generated Soft98 identifier leaked into runtime: ${needle}`);
  if (userscript.includes(needle)) throw new Error(`Fragile generated Soft98 identifier leaked into userscript: ${needle}`);
}
if (!/PersianBlocker|MasterKia/.test(runtime)) throw new Error("PersianBlocker notice handling is missing");
if (!/\.toDataURL\("image\/png"\)/.test(runtime) || !/soft98-pro-favicon/.test(runtime)) {
  throw new Error("Canvas favicon status indicator is missing");
}
for (const removed of [
  "تبلیغات حذف شد، لینک‌ها سالم ماندند",
  "anti-blocking test answered",
  "soft98-ad-blocker-taunt",
]) {
  if (runtime.includes(removed) || userscript.includes(removed)) throw new Error(`Removed success banner text leaked into build: ${removed}`);
}
if (!/pro:!0/.test(runtime) || !/darkDesign:!0/.test(runtime)) {
  throw new Error("Soft98 Pro and dark design must be enabled by default");
}
if (!/data-toggle=\\?"tab\\?"/.test(runtime) || !/font-family:\\?Arial/.test(runtime) || !/fa-desktop-alt/.test(runtime)) {
  throw new Error("Dark theme tab and icon fallback styling is missing");
}
if (!/data:image\/svg\+xml/.test(runtime) || !/encodeURIComponent/.test(runtime)) {
  throw new Error("Transparent SVG logo replacement is missing");
}
if (!/data-open=true/.test(runtime) || !/cubic-bezier/.test(runtime)) {
  throw new Error("Soft98 Pro control panel transition styling is missing");
}
const screenshotTool = fs.readFileSync(path.join(ROOT, "tools", "screenshot.js"), "utf8");
if (!screenshotTool.includes("/live?panel=1")) throw new Error("Screenshot generator must capture the open Pro panel");
if (!userscript.includes("DRSDavidSoft/soft98-pro/main/soft98-pro.user.js")) {
  throw new Error("Userscript update URL must point at the dedicated Soft98 repo");
}

console.log("Soft98 build validation passed");
