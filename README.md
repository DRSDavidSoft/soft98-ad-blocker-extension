# Soft98 Pro

Soft98 Pro ships as both a userscript and a browser extension for Chrome, Edge, and Firefox.

Both install paths are built from the same shared runtime in `src/runtime.js`, so patching, diagnostics, anti-adblock handling, PersianBlocker notice removal, download-link recovery, and Soft98 Pro behavior do not drift.

## Downloads

Use the latest GitHub release:

- `soft98-pro-chromium-*.zip` for Chrome and Edge.
- `soft98-pro-firefox-*.zip` for Firefox temporary/manual install.
- `soft98-pro.user.js` for userscript managers.

## Build

```bash
npm ci
npm run ci
```

Build outputs:

- `soft98-pro.user.js`: root userscript for raw GitHub install/update.
- `dist/userscript/soft98-pro.user.js`: release userscript copy.
- `dist/chromium`: Manifest V3 build for Chrome and Edge.
- `dist/firefox`: Firefox build with early page-runtime injection.
- `dist/packages/*.zip`: release-ready ZIPs.

## Install Unpacked

Chrome or Edge:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Load unpacked: `dist/chromium`.

Firefox:

1. Open `about:debugging#/runtime/this-firefox`.
2. Load Temporary Add-on.
3. Select `dist/firefox/manifest.json`.

## Runtime

The runtime favors behavior, structure, script signatures, and link preservation over generated class names or short random identifiers.

User-facing UI uses Persian when the browser language starts with `fa` or the browser timezone is `Asia/Tehran`; otherwise it uses English.

Console diagnostics are available through `window.Soft98AdBlocker.report()`, `trapCheck()`, `resetHandles()`, `events`, and `stats`.
