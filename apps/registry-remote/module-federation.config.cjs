/** @type {Record<string, unknown>} */
module.exports = {
	name: "registry",
	filename: "remoteEntry.js",
	dts: false,
	exposes: {
		"./lifecycles": "./src/registry-spa.tsx",
	},
	shared: {
		react: {
			requiredVersion: "^19.2.0",
			singleton: true,
		},
		"react-dom": {
			requiredVersion: "^19.2.0",
			singleton: true,
		},
	},
};
