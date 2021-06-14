# preact-cli

## 3.3.0

### Minor Changes

- [#1580](https://github.com/preactjs/preact-cli/pull/1580) [`95198f3`](https://github.com/preactjs/preact-cli/commit/95198f36fa608f6edddfe527517b42fc48b2588d) Thanks [@developit](https://github.com/developit)! - Generate modern (approximately ES2017) code in development mode to better match production output.

### Patch Changes

- [#1573](https://github.com/preactjs/preact-cli/pull/1573) [`022d9a8`](https://github.com/preactjs/preact-cli/commit/022d9a8119ea9a4e09963ffbe5ee9adbc9fb0d92) Thanks [@rschristian](https://github.com/rschristian)! - Uses native FS promise API rather than promisifying manually

## 3.2.2

### Patch Changes

- [#1568](https://github.com/preactjs/preact-cli/pull/1568) [`bc6d5f6`](https://github.com/preactjs/preact-cli/commit/bc6d5f6e87e9cd5dc652d7e294fff150b7068c4d) Thanks [@rschristian](https://github.com/rschristian)! - Fixes breaking change to the getLoadersByName config helper

## 3.2.1

### Patch Changes

- [#1567](https://github.com/preactjs/preact-cli/pull/1567) [`971e633`](https://github.com/preactjs/preact-cli/commit/971e6335ddd20e8cc0233607c47942831e31f4cb) Thanks [@rschristian](https://github.com/rschristian)! - Reverts update to fork-ts-checker-webpack-plugin

## 3.2.0

### Minor Changes

- [#1465](https://github.com/preactjs/preact-cli/pull/1465) [`3a11043`](https://github.com/preactjs/preact-cli/commit/3a11043f89deee09bc41947677e1a3a58b4ee1bf) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - chore: update dependencies

## 3.1.0

### Minor Changes

- [`4b81641`](https://github.com/preactjs/preact-cli/commit/4b8164172ec4e7e9a725909b58bc54eb1f82ed8a) [#1418](https://github.com/preactjs/preact-cli/pull/1418) Thanks [@merceyz](https://github.com/merceyz)! - Added monorepo and Yarn PnP support by correctly loading dependencies, removing faulty install checks, and adding undeclared dependencies

### Patch Changes

- [`0e4f06a`](https://github.com/preactjs/preact-cli/commit/0e4f06a60bb08869831d66844b6b92a948f33e4c) [#1503](https://github.com/preactjs/preact-cli/pull/1503) Thanks [@rschristian](https://github.com/rschristian)! - Ensures the create command returns startup instructions to users

* [`df48437`](https://github.com/preactjs/preact-cli/commit/df484371553a72f3fa5a72effe9577530d95f648) [#1499](https://github.com/preactjs/preact-cli/pull/1499) Thanks [@rschristian](https://github.com/rschristian)! - CLI now only conditionally outputs 200.html & preact_prerender_data.json

- [`c33f020`](https://github.com/preactjs/preact-cli/commit/c33f0207d26402f9b27827acd52303dfd6350c38) [#1435](https://github.com/preactjs/preact-cli/pull/1435) Thanks [@rschristian](https://github.com/rschristian)! - Change ensures root ReadMe is bundled with CLI package on publish

* [`bf668b1`](https://github.com/preactjs/preact-cli/commit/bf668b1e9eda89e45bf6711decc6ee53d76a5880) [#1530](https://github.com/preactjs/preact-cli/pull/1530) Thanks [@rschristian](https://github.com/rschristian)! - Fixes bug causing wrong port to be given to Webpack config

- [`cc2f3e7`](https://github.com/preactjs/preact-cli/commit/cc2f3e787c25696d68aaae6e17c8466b2b6675ac) [#1423](https://github.com/preactjs/preact-cli/pull/1423) Thanks [@rschristian](https://github.com/rschristian)! - Fixes bug with style loader that would strip non-module CSS files if 'sideEffects' was set to false for the package.

* [`c9c48db`](https://github.com/preactjs/preact-cli/commit/c9c48db444b96201d5f478cdb73f668195dcdee2) [#1504](https://github.com/preactjs/preact-cli/pull/1504) Thanks [@rschristian](https://github.com/rschristian)! - Replacing mkdirp with native mkdir recursive

- [`977d59a`](https://github.com/preactjs/preact-cli/commit/977d59a30ec5062569dea62c40359f2be3b2d87e) [#1527](https://github.com/preactjs/preact-cli/pull/1527) Thanks [@jamesgeorge007](https://github.com/jamesgeorge007)! - Do not prompt on supplying the template as an argument

* [`daa51ac`](https://github.com/preactjs/preact-cli/commit/daa51ac4aa5ea10c824f7a33bfc03d71d0aaf5ae) [#1522](https://github.com/preactjs/preact-cli/pull/1522) Thanks [@jamesgeorge007](https://github.com/jamesgeorge007)! - Minor typographical fix

- [`24c7473`](https://github.com/preactjs/preact-cli/commit/24c7473f27fa401449a6da82b37b897b5a45894b) [#1516](https://github.com/preactjs/preact-cli/pull/1516) Thanks [@jgoamakf](https://github.com/jgoamakf)! - Do not produce preRenderData when --no-prerender option is specified.

* [`9f9277b`](https://github.com/preactjs/preact-cli/commit/9f9277be2ed50476147bae5567640b36740b4d38) [#1534](https://github.com/preactjs/preact-cli/pull/1534) Thanks [@rschristian](https://github.com/rschristian)! - Fixes SW flag in dev

## 3.0.5

### Patch Changes

- [`57cb566`](https://github.com/preactjs/preact-cli/commit/57cb566a697ceebcd094057b9db48827897d5b5b) [#1490](https://github.com/preactjs/preact-cli/pull/1490) Thanks [@rschristian](https://github.com/rschristian)! - Adds the 'prerender' argument to the list of arguments to be validated against

## 3.0.4

### Patch Changes

- [`6670ba0`](https://github.com/preactjs/preact-cli/commit/6670ba0b9ee03f03f98cfec490aee996b58a17eb) [#1461](https://github.com/preactjs/preact-cli/pull/1461) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - fix: await copying of files in create command

* [`30fb1fc`](https://github.com/preactjs/preact-cli/commit/30fb1fc0a2ec101a46ecbb6539ffccc2aec215d7) [#1478](https://github.com/preactjs/preact-cli/pull/1478) Thanks [@rschristian](https://github.com/rschristian)! - No longer copies 'sw-debug.js' to output directory on prod builds. No functional changes, as it was not used.

- [`2c53b0a`](https://github.com/preactjs/preact-cli/commit/2c53b0a94952c19f8e625dfa52ecbc0ae8c0c3cb) [#1438](https://github.com/preactjs/preact-cli/pull/1438) Thanks [@VanTanev](https://github.com/VanTanev)! - fix: allow an async component to return null rendering

* [`fce7e7a`](https://github.com/preactjs/preact-cli/commit/fce7e7a2a1b3f5cbe9856004a89723ef75b016bf) [#1460](https://github.com/preactjs/preact-cli/pull/1460) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - chore: remove preact-compat as it's unused

- [`ab84275`](https://github.com/preactjs/preact-cli/commit/ab84275c7d84c99a57085f9913d93069d461fb95) [#1434](https://github.com/preactjs/preact-cli/pull/1434) Thanks [@rschristian](https://github.com/rschristian)! - This disable SSR size tracking. This stops `size-plugin-ssr.json` from being generated and stops file sizes from being reported to the developer.

* [`67fafc8`](https://github.com/preactjs/preact-cli/commit/67fafc8e3d0d98665a193e10bc7c9a1ce2aeeedf) [#1467](https://github.com/preactjs/preact-cli/pull/1467) Thanks [@prateekbh](https://github.com/prateekbh)! - Allow only valid options for commands.

## 3.0.2

### Patch Changes

- [`07c9a9c`](https://github.com/preactjs/preact-cli/commit/07c9a9c87081d38ecb1729f57091f3984d454428) [#1413](https://github.com/preactjs/preact-cli/pull/1413) Thanks [@JoviDeCroock](https://github.com/JoviDeCroock)! - patch cleanFilename to also fix typescript and jsx files

- [`ff79f0b`](https://github.com/preactjs/preact-cli/commit/ff79f0b2f6f0f8877001d075947274306884cf89) [#1406](https://github.com/preactjs/preact-cli/pull/1406) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - Fix the prefresh integration, using `--refresh` should now correctly enable fast-refresh
