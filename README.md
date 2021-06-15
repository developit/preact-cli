# preact-cli [![NPM Downloads](https://img.shields.io/npm/dm/preact-cli.svg)](https://www.npmjs.com/package/preact-cli) [![NPM Version](https://img.shields.io/npm/v/preact-cli.svg)](https://www.npmjs.com/package/preact-cli)

> Start building a [Preact] Progressive Web App in seconds 🔥

### Contents

- [Features](#features)
- [Usage](#usage)
- [Official Templates](#official-templates)
- [CLI Options](#cli-options)
  - [preact create](#preact-create)
  - [preact build](#preact-build)
  - [preact watch](#preact-watch)
  - [preact list](#preact-list)
  - [preact info](#preact-info)
- [Deploying](#deploying)
- [Pre-rendering](#pre-rendering)
- [Custom Configuration](#custom-configuration)
  - [Plugins](#plugins)
  - [Browserslist](#browserslist)
  - [Babel](#babel)
  - [Webpack](#webpack)
  - [Prerender multiple routes](#prerender-multiple-routes)
  - [Template](#template)
- [Using CSS preprocessors](#using-css-preprocessors)
  - [SASS](#sass)
  - [LESS](#less)

### Features

- **100/100 Lighthouse score**, right out of the box ([proof])
- Fully **automatic code splitting** for routes _(see [Route-Based Code Splitting](#route-based-code-splitting))_
- Transparently code-split any component with an [`async!`] prefix _(pending [TypeScript](https://github.com/preactjs-templates/typescript) support, use `components/async` directory instead)_
- Auto-generated [Service Workers] for offline caching powered by [Workbox]
- [PRPL] pattern support for efficient loading
- Zero-configuration pre-rendering / server-side rendering hydration
- Support for CSS Modules, LESS, Sass, Stylus; with Autoprefixer
- Monitor your bundle/chunk sizes with built-in tracking
- Automatic app mounting, debug helpers & Hot Module Replacement
- In just **4.5kb** you get a productive environment:
  - [preact]
  - [preact-router]
  - 1.5kb of conditionally-loaded polyfills for [fetch] & [Promise]

### Requirements

> **Important**: [Node.js](https://nodejs.org/en/) > V8.x and npm 5.2+ is a minimum requirement.

### Usage

```sh
$ npx preact-cli create <template-name> <project-name>
```

Example:

```sh
$ npx preact-cli create default my-project
```

The above command pulls the template from [preactjs-templates/default], prompts for some information, and generates the project at `./my-project/`.

### Official Templates

The purpose of official preact project templates are to provide opinionated development tooling setups so that users can get started with actual app code as fast as possible. However, these templates are un-opinionated in terms of how you structure your app code and what libraries you use in addition to preact.js.

All official project templates are repos in the [preactjs-templates organization]. When a new template is added to the organization, you will be able to run `preact create <template-name> <project-name>` to use that template.

Current available templates include:

- [default] - Default template with all features.

- [material] - material template using preact-material-components

- [simple] - The simplest possible preact setup in a single file

- [netlify] - Netlify CMS template using preact.

- [typescript] - Default template implemented in TypeScript. NOTE: TypeScript by default does not support `async!` import syntax.

- [widget] - Template for a widget to be embedded in another website.

> 💁 Tip: Any Github repo with a `'template'` folder can be used as a custom template: <br /> `preact create <username>/<repository> <project-name>`

### CLI Options

#### preact create

Create a project to quick start development.

```
$ preact create <template-name> <project-name>

  --name        The application name.
  --cwd         A directory to use instead of $PWD.
  --force       Force option to create the directory for the new app  [boolean] [default: false]
  --yarn        Installs dependencies with yarn.                      [boolean] [default: false]
  --git         Initialize version control using git.                 [boolean] [default: false]
  --install     Installs dependencies.                                [boolean] [default: true]
```

Note: If you don't specify enough data to the `preact create` command, it will prompt the required questions.

#### preact build

Create a production build

You can disable `default: true` flags by prefixing them with `--no-<option>`; for example, `--no-sw`, `--no-esm`, and `--no-inline-css`.

```
$ preact build

    --src              Specify source directory  (default src)
    --dest             Specify output directory  (default build)
    --cwd              A directory to use instead of $PWD  (default .)
    --esm              Builds ES-2015 bundles for your code  (default true)
    --sw               Generate and attach a Service Worker  (default true)
    --babelConfig      Path to custom Babel config (default .babelrc)
    --json             Generate build stats for bundle analysis
    --template         Path to custom HTML template
    --preload          Adds preload tags to the document its assets  (default false)
    --analyze          Launch interactive Analyzer to inspect production bundle(s)
    --prerender        Renders route(s) into generated static HTML  (default true)
    --prerenderUrls    Path to pre-rendered routes config  (default prerender-urls.json)
    --brotli           Adds brotli redirects to the service worker  (default false)
    --inline-css       Adds critical css to the prerendered markup  (default true)
    -c, --config       Path to custom CLI config  (default preact.config.js)
    -v, --verbose      Verbose output
    -h, --help         Displays this message
```

#### preact watch

Spin up a development server with multiple features like `hot-module-replacement`, `module-watcher`

```
$ preact watch

    --src              Specify source directory  (default src)
    --cwd              A directory to use instead of $PWD  (default .)
    --esm              Builds ES-2015 bundles for your code  (default false)
    --clear            Clear the console (default true)
    --sw               Generate and attach a Service Worker  (default false)
    --babelConfig      Path to custom Babel config (default .babelrc)
    --json             Generate build stats for bundle analysis
    --https            Run server with HTTPS protocol
    --key              Path to PEM key for custom SSL certificate
    --cert             Path to custom SSL certificate
    --cacert           Path to optional CA certificate override
    --prerender        Pre-render static content on first run
    --prerenderUrls    Path to pre-rendered routes config  (default prerender-urls.json)
    --template         Path to custom HTML template
    --refresh          Will use [`Preact-refresh`](https://github.com/JoviDeCroock/preact-refresh) to do hot-reloading
    -c, --config       Path to custom CLI config  (default preact.config.js)
    -H, --host         Set server hostname  (default 0.0.0.0)
    -p, --port         Set server port  (default 8080)
    -h, --help         Displays this message
```

Note:

1. You can run dev server using `HTTPS` then you can use the following `HTTPS=true preact watch`
2. You can run the dev server on a different port using `PORT=8091 preact watch`

#### preact list

Lists all the official preactjs-cli repositories

```sh
$ preact list
```

#### preact info

Prints debugging information concerning the local environment.

### Deploying

```sh
# create a production build:
npm run build

# generate configuration in Firebase Hosting format:
npm run serve -- --server config

# Copy your static files to a server!
```

### Pre-rendering

Preact CLI in order to follow [PRPL] pattern renders initial route (`/`) into generated static `index.html` - this ensures that users get to see your page before any JavaScript is run, and thus providing users with slow devices or poor connection your website's content much faster.

Preact CLI does this by rendering your app inside node - this means that we don't have access to DOM or other global variables available in browsers, similar how it would be in server-side rendering scenarios. In case you need to rely on browser APIs you could:

- drop out of prerendering by passing `--no-prerender` flag to `preact build`,
- write your code in a way that supports server-side rendering by wrapping code that requires browser's APIs in conditional statements `if (typeof window !== "undefined") { ... }` ensuring that on server those lines of code are never reached. Alternatively you could use a helper library like [window-or-global](https://www.npmjs.com/package/window-or-global).

### Custom Configuration

#### Plugins

To make customizing your configuration easier, preact-cli supports plugins. Visit the [Plugins wiki] for a tutorial on how to use them.

#### Browserslist

You may customize your list of supported browser versions by declaring a [`"browserslist"`] key within your `package.json`. Changing these values will modify your JavaScript (via [`babel-preset-env`]) and your CSS (via [`autoprefixer`](https://github.com/postcss/autoprefixer)) output.

By default, `preact-cli` emulates the following config:

> `package.json`

```json
{
	"browserslist": ["> 0.25%", "IE >= 9"]
}
```

#### Babel

To customize Babel, you have two options:

1. You may create a [`.babelrc`] file in your project's root directory. Any settings you define here will overwrite matching config-keys within [Preact CLI preset]. For example, if you pass a `"plugins"` object, it will replace & reset all Babel plugins that Preact CLI defaults to.

2. If you'd like to modify or add to the existing Babel config, you must use a `preact.config.js` file. Visit the [Webpack](#webpack) section for more info, or check out the [Customize Babel] example!

#### Webpack

To customize preact-cli create a `preact.config.js` or a `preact.config.json` file.

> `preact.config.js`

```js
// ... imports or other code up here ...

// these props are both optional
export default {
	// you can add preact-cli plugins here
	plugins: [
		// either a function
		// (you'd probably import this because you can use the `webpack` function instead of an inline plugin)
		function () {},
		// strings also work (they get imported by preact-cli), useful for the json config
		'plugin-name',
		// with options
		[
			'plugin-name',
			{
				option: true,
			},
		],
	],
	/**
	 * Function that mutates the original webpack config.
	 * Supports asynchronous changes when a promise is returned (or it's an async function).
	 *
	 * @param {object} config - original webpack config.
	 * @param {object} env - options passed to the CLI.
	 * @param {WebpackConfigHelpers} helpers - object with useful helpers for working with the webpack config.
	 * @param {object} options - this is mainly relevant for plugins (will always be empty in the config), default to an empty object
	 **/
	webpack(config, env, helpers, options) {
		/** you can change the config here **/
	},
};
```

See [WebpackConfigHelpers] docs for more info on `helpers` argument which contains methods to find various parts of configuration. Additionally see our [recipes wiki] containing examples on how to change webpack configuration.

#### Prerender multiple routes

The `--prerender` flag will prerender by default only the root of your application.
If you want to prerender other routes you can create a `prerender-urls.json` file, which contains the set of routes you want to render.
The format required for defining your routes is an array of objects with a `url` key and an optional `title` key.

> `prerender-urls.json`

```json
[
	{
		"url": "/",
		"title": "Homepage"
	},
	{
		"url": "/route/random"
	}
]
```

You can customise the path and/or name of `prerender-urls.json` by using the flag `--prerenderUrls`.

```sh
preact build --prerenderUrls src/prerender-urls.json
```

If a static JSON file is too restrictive, you may want to provide a javascript file that exports your routes instead.
Routes can be exported as a JSON string or an object and can optionally be returned from a function.

```js
// prerender-urls.js
module.exports = [
	{
		url: '/',
		title: 'Homepage',
	},
	{
		url: '/route/random',
	},
];
```

#### Template

A template is used to render your page by [EJS](https://ejs.co/).  
You can uses the data of `prerenderUrls` which does not have `title`, using `htmlWebpackPlugin.options.CLI_DATA.preRenderData` in EJS.

The default one is visible [here](packages/cli/lib/resources/template.html) and it's going to be enough for the majority of cases.

If you want to customise your template you can pass a custom template with the `--template` flag.

The `--template` flag is available on the `build` and `watch` commands.

```sh
preact build --template src/template.html
preact watch --template src/template.html
```

### Using CSS preprocessors

The default templates comes with a `.css` file for each component. You can start using CSS preprocessors at any given time during your project lifecycle by installing additional packages and then simply replacing those `.css` files.

#### [SASS]

- `npm install --save-dev node-sass sass-loader@10` (inside your preact application folder)
- start replacing `.css` files with `.scss` files

#### [LESS]

- `npm install --save-dev less less-loader` (inside your preact application folder)
- start replacing `.css` files with `.less` files

### Using Environment Variables

You can reference and use environment variables in your `preact.config.js` by using `process.env`:

```js
export default {
	webpack(config, env, helpers, options) {
		if (process.env.MY_VARIABLE) {
			/** You can add a config here that will only used when your variable is truthy **/
		}
	},
};
```

If you'd like to use these variables in your application, you can use the [DefinePlugin] config from our recipes wiki.

[promise]: https://npm.im/promise-polyfill
[fetch]: https://github.com/developit/unfetch
[preact]: https://github.com/preactjs/preact
[webpackconfighelpers]: docs/webpack-helpers.md
[`.babelrc`]: https://babeljs.io/docs/usage/babelrc
[simple]: https://github.com/preactjs-templates/simple
[`"browserslist"`]: https://github.com/ai/browserslist
[```.babelrc```]: https://babeljs.io/docs/usage/babelrc
[default]: https://github.com/preactjs-templates/default
[workbox]: https://developers.google.com/web/tools/workbox
[preact-router]: https://github.com/preactjs/preact-router
[material]: https://github.com/preactjs-templates/material
[netlify]: https://github.com/preactjs-templates/netlify
[typescript]: https://github.com/preactjs-templates/typescript
[widget]: https://github.com/preactjs-templates/widget
[plugins wiki]: https://github.com/preactjs/preact-cli/wiki/Plugins
[preactjs-templates organization]: https://github.com/preactjs-templates
[preactjs-templates/default]: https://github.com/preactjs-templates/default
[recipes wiki]: https://github.com/preactjs/preact-cli/wiki/Config-Recipes
[prpl]: https://developers.google.com/web/fundamentals/performance/prpl-pattern
[`babel-preset-env`]: https://github.com/babel/babel-preset-env#targetsbrowsers
[proof]: https://googlechrome.github.io/lighthouse/viewer/?gist=142af6838482417af741d966e7804346
[preact cli preset]: https://github.com/preactjs/preact-cli/blob/master/packages/cli/lib/lib/babel-config.js
[service workers]: https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
[customize babel]: https://github.com/preactjs/preact-cli/wiki/Config-Recipes#customising-babel-options-using-loader-helpers
[`async!`]: https://github.com/preactjs/preact-cli/blob/1.4.1/examples/full/src/components/app.js#L7
[sass]: https://sass-lang.com
[less]: http://lesscss.org
[defineplugin]: https://github.com/preactjs/preact-cli/wiki/Config-Recipes#use-environment-variables-in-your-application

### Route-Based Code Splitting

"Route" components are automatically code-splitted at build time to create smaller bundles and avoid loading more code than is needed by each page. This works by intercepting imports for route components with an [async loader](https://github.com/preactjs/preact-cli/tree/master/packages/async-loader), which returns a lightweight wrapper component that handles code splitting seamlessly.

Automatic code splitting is applied to all JavaScript and TypeScript files in the following locations:

<table>
<thead><tr><th>Pattern</th><th>Examples</th></tr></thead>
<tbody>
<tr><td>
<pre>src/<b>routes</b>/<kbd>NAME</kbd></pre>
</td><td>
<code>src/routes/home.js</code><br>
<code>src/routes/about/index.tsx</code>
</td></tr>
<tr><td>
<pre>src/components/<b>routes</b>/<kbd>NAME</kbd></pre>
</td><td>
<code>src/components/routes/profile.ts</code><br>
<code>src/components/routes/profile/index.js</code>
</td></tr>
<tr><td>
<pre>src/components/<b>async</b>/<kbd>NAME</kbd></pre>
</td><td>
<code>src/components/async/profile.ts</code><br>
<code>src/components/async/profile/index.js</code>
</td></tr>
</tbody></table>

> **Note**:  
> Automatic code splitting **only** supports default exports, not named exports:
>
> ```diff
> - import { Profile } from './routes/profile';
> + import Profile from './routes/profile';
> ```
>
> This is an intentional limitation that ensures effective code splitting. For components that need named exports, place them in a directory that doesn't trigger automatic code splitting. You can then manually code-split the default export by re-exporting it from `routes/`, `components/async/` or importing it with the `"async!"` prefix.
