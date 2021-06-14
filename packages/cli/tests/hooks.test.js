const { create, watch } = require('./lib/cli');
const { hooks } = require('./lib/utils');

describe('preact', () => {
	let intervalId;

	afterEach(() => {
		clearInterval(intervalId);
		intervalId = null;
	});

	it('should emit a devServerRunning event after the server starts', (done) => {
		let hookCalled;
		hooks.devServerRunning.tap('TestPlugin', () => {
			hookCalled = true;
		});

		create('default').then((app) => {
			watch(app, 8083).then((server) => {
				// We need to wait not only for the server to start but also for the
				// stats to be printed to stdout.
				intervalId = setInterval(() => {
					if (hookCalled) {
						expect(hookCalled).toBe(true);
						server.close();
						done();
					}
				}, 1000);
			});
		});
	});
});
