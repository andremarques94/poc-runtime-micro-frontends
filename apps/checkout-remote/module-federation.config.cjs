/** @type {Record<string, unknown>} */
module.exports = {
	name: "checkout",
	filename: "remoteEntry.js",
	dts: false,
	exposes: {
		"./lifecycles": "./src/checkout-spa.tsx",
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
