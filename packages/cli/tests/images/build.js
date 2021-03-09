const common = {
	'polyfills.a827a.js': 5149,
	'polyfills.a827a.js.map': 19515,
};

exports.default = exports.full = Object.assign({}, common, {
	'assets/favicon.ico': 15086,
	'assets/icons/android-chrome-192x192.png': 14058,
	'assets/icons/android-chrome-512x512.png': 51484,
	'assets/icons/apple-touch-icon.png': 12746,
	'assets/icons/favicon-16x16.png': 626,
	'assets/icons/favicon-32x32.png': 1487,
	'assets/icons/mstile-150x150.png': 9050,
	'bundle.51d60.js': 21429,
	'bundle.51d60.js.map': 103001,
	'bundle.7e56a.css': 901,
	'favicon.ico': 15086,
	'index.html': 2034,
	'manifest.json': 455,
	'preact_prerender_data.json': 11,
	'push-manifest.json': 812,
	'route-home.chunk.9be6a.js': 388,
	'route-home.chunk.9be6a.js.map': 626,
	'route-home.chunk.e6c71.css': 58,
	'route-profile.chunk.62c75.css': 61,
	'route-profile.chunk.77929.js': 1250,
	'route-profile.chunk.77929.js.map': 2237,
	'ssr-build/ssr-bundle.6e806.css': 1281,
	'ssr-build/ssr-bundle.6e806.css.map': 1250,
	'ssr-build/ssr-bundle.js': 9976,
	'ssr-build/ssr-bundle.js.map': 30887,
});
exports['default-esm'] = exports.full = Object.assign({}, exports.default, {
	'bundle.*.esm.js': 21135,
	'bundle.*.esm.js.map': 96,
	'polyfills.*.esm.js': 5151,
	'polyfills.*.esm.js.map': 99,
	'route-home.chunk.*.esm.js': 377,
	'route-home.chunk.*.esm.js.map': 106,
	'route-profile.chunk.*.esm.js': 988,
	'route-profile.chunk.*.esm.js.map': 109,
	'index.html': 2469,
	'push-manifest.json': 466,
});

exports.sass = `
<body>
	<div class="background__21gOq">
		<h1>Header on background</h1>
		<p>Paragraph on background</p>
	</div>
	{{ ... }}
</body>
`;

exports.sideEffectCss = `
<head>
  <meta charset="utf-8">
  <title>side-effect-css<\\/title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="apple-touch-icon" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
  <link rel="manifest" href="\\/manifest\\.json">
  <style>h1{background:#673ab8}<\\/style>
  <link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
	<noscript>
    <link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
  </noscript>
<\\/head>
`;

exports.prerender = {};

exports.prerender.heads = {};
exports.prerender.heads.home = `
<head>
	<meta charset="utf-8">
	<title>Home<\\/title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel="manifest" href="\\/manifest\\.json">
	<style>html{padding:0}<\\/style>
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
	<noscript>
    <link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
  </noscript>
<\\/head>
`;

exports.prerender.heads.route66 = `
<head>
	<meta charset="utf-8">
	<title>Route66<\\/title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel="manifest" href="\\/manifest\\.json">
	<style>html{padding:0}<\\/style>
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
	<noscript>
    <link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
  </noscript>
<\\/head>
`;

exports.prerender.heads.custom = `
<head>
	<meta charset="utf-8">
	<title>Custom<\\/title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel="manifest" href="\\/manifest\\.json">
	<style>html{padding:0}<\\/style>
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
	<noscript>
    <link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
  </noscript>
<\\/head>
`;

exports.preload = {};

exports.preload.head = `
<head>
	<meta charset=\\"utf-8\\">
	<title>preact-prerender<\\/title>
	<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1\\">
	<meta name=\\"mobile-web-app-capable\\" content=\\"yes\\">
	<meta name=\\"apple-mobile-web-app-capable\\" content=\\"yes\\">
	<link rel=\\"apple-touch-icon\\" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel=\\"manifest\\" href=\\"\\/manifest\\.json\\">
	<link rel=\\"preload\\" href=\\"\\/bundle\\.\\w{5}\\.js\\" as=\\"script\\">
	<link rel=\\"preload\\" href=\\"\\/route-home\\.chunk\\.\\w{5}\\.js\\" as=\\"script\\">
	<link rel=\\"preload\\" href=\\"\\/route-home\\.chunk\\.\\w{5}\\.css\\" as=\\"style\\">
	<style>html{padding:0}<\\/style>
	<link href=\\"\\/bundle\\.\\w{5}\\.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
	<noscript>
    <link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
  </noscript>
</head>
`;

exports.prerender.home = `
<body>
	<div id="app">
		<div>Home</div>
	</div>
	{{ ... }}
</body>
`;

exports.prerender.route = `
<body>
	<div id="app">
		<div>Route66</div>
	</div>
	{{ ... }}
</body>
`;

exports.prerender.custom = `
<body>
	<div id="app">
		<div>It worked!</div>
	</div>
	{{ ... }}
</body>
`;

exports.prerender.customhook = `
<body>
	<div id="app">
		<div>It worked with hook!</div>
	</div>
	{{ ... }}
</body>
`;

exports.prerender.htmlSafe = `
<body>
	<div id="app">
		<div>&lt;script&gt;It is HTML safe&lt;/script&gt;</div>
	</div>
	{{ ... }}
</body>
`;

exports.webpack = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>preact-webpack</title>
	</head>
	<body>
		<h1>Guess what</h1>
		<h2>This is an app with custom template</h2>
		{{ ... }}
	</body>
</html>
`;

exports.template = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Custom title</title>
	</head>
	<body>
		<h1>Guess what</h1>
		<h2>This is an app with custom template</h2>
		{{ ... }}
	</body>
</html>
`;

exports.templateReplaced = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>preact-webpack</title>
		<link rel="manifest" href="/manifest.json">
	</head>
	<body>
		<h1>Guess what</h1>
		<h2>This is an app with custom template</h2>
		{{ ... }}
	</body>
</html>
`;
