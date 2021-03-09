---
'preact-cli': patch
---

Fixes bug with style loader that would strip non-module CSS files if 'sideEffects' was set to false for the package.
