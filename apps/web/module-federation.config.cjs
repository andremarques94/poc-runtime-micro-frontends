/** @type {Record<string, unknown>} */
module.exports = {
	name: "web",
	dts: false,
	shared: {
		react: {
			eager: true,
			requiredVersion: "^19.2.0",
			singleton: true,
		},
		"react-dom": {
			eager: true,
			requiredVersion: "^19.2.0",
			singleton: true,
		},
	},
};
