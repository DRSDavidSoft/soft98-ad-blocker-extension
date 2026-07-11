# Development 🛠️

Install and validate locally:

```bash
npm ci
npm run ci
```

Build outputs:

- `soft98-pro.user.js`
- `dist/userscript/soft98-pro.user.js`
- `dist/chromium`
- `dist/firefox`
- `dist/packages/*.zip`

The main runtime lives in `src/runtime.js`. Keep browser-extension and userscript behavior shared there unless a browser-specific bridge is required.
