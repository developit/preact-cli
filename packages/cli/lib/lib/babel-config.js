module.exports = function (env, options = {}) {
	const { production: isProd, refresh } = env || {};

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					loose: true,
					modules: options.modules || false,
					targets: {
						browsers: options.browsers,
					},
					exclude: ['transform-regenerator'],
				},
			],
		],
		plugins: [
			require.resolve('@babel/plugin-syntax-dynamic-import'),
			require.resolve('@babel/plugin-transform-object-assign'),
			[require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
			[
				require.resolve('@babel/plugin-proposal-class-properties'),
				{ loose: true },
			],
			require.resolve('@babel/plugin-proposal-object-rest-spread'),
			isProd &&
				require.resolve('babel-plugin-transform-react-remove-prop-types'),
			require.resolve('babel-plugin-macros'),
			[
				require.resolve('@babel/plugin-transform-react-jsx'),
				{ pragma: 'h', pragmaFrag: 'Fragment' },
			],
		].filter(Boolean),
		overrides: [
			// Transforms to apply only to first-party code:
			{
				exclude: '**/node_modules/**',
				presets: [
					[require.resolve('@babel/preset-typescript'), { jsxPragma: 'h' }],
				],
				plugins: [
					!isProd && refresh && require.resolve('react-refresh/babel'),
				].filter(Boolean),
			},
		],
	};
};
