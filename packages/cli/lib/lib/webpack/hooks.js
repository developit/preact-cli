const SyncHook = require('tapable').SyncHook;

module.exports = {
	devServerRunning: new SyncHook(),
};
