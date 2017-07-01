module.exports = class PushManifestPlugin {
	apply(compiler) {
		compiler.plugin('emit', function(compilation, callback) {
			let defaults = {
					'style.css': {
						type: 'style',
						weight: 1
					},
					'bundle.js': {
						type: 'script',
						weight: 1
					},
				},
				manifest = {
					'/': defaults
				};

			for (let filename in compilation.assets) {
				if (/route-/.test(filename) && !/\.map$/.test(filename)) {
					let path = filename.replace(/route-/, '/').replace(/\.chunk(\.\w+)?\.js$/, '').replace(/\/home/, '/');
					manifest[path] = {
						...defaults,
						[filename]: {
							type: 'script',
							weight: .9
						}
					};
				}
			}

			let output = JSON.stringify(manifest);
			compilation.assets['push-manifest.json'] = {
				source() {
					return output;
				},
				size() {
					return output.length;
				}
			};

			callback();
		});
	}
};
