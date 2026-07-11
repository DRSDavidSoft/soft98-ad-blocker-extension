# Diagnostics 🕵️

Soft98 Pro exposes console diagnostics when page conditions allow it.

Useful calls:

```js
window.Soft98AdBlocker.report()
window.Soft98AdBlocker.trapCheck()
window.Soft98AdBlocker.resetHandles()
window.Soft98AdBlocker.stats
window.Soft98AdBlocker.events
```

`window.Soft98Pro` is also exposed as a friendly alias.

The favicon is canvas-generated:

- Dark Soft98 Pro icon when the Pro dark theme is enabled.
- Success-colored `S` when cleanup succeeds without the Pro theme.
