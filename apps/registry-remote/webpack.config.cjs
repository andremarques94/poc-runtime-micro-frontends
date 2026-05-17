const path = require("node:path");
const {
	ModuleFederationPlugin,
} = require("@module-federation/enhanced/webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const mfConfig = require("./module-federation.config.cjs");

/** @type {import("webpack").Configuration} */
module.exports = {
	context: __dirname,
	entry: "./src/index.ts",
	mode: process.env.NODE_ENV === "production" ? "production" : "development",
	devtool: "eval-source-map",
	output: {
		clean: true,
		filename: "[name].[contenthash].js",
		path: path.resolve(__dirname, "dist"),
		publicPath: "auto",
	},
	resolve: {
		alias: {
			api: path.resolve(__dirname, "../api/src"),
		},
		extensions: [".tsx", ".ts", ".jsx", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: (filepath) => {
					if (
						filepath.includes(`${path.sep}apps${path.sep}api${path.sep}src`)
					) {
						return false;
					}
					return /node_modules/.test(filepath);
				},
				use: {
					loader: "ts-loader",
					options: { transpileOnly: true },
				},
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	plugins: [
		new ModuleFederationPlugin(mfConfig),
		new HtmlWebpackPlugin({
			template: "./public/index.html",
		}),
	],
	devServer: {
		port: 5175,
		historyApiFallback: true,
		hot: true,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
		},
		proxy: [
			{
				context: ["/api"],
				target: "http://localhost:3000",
				pathRewrite: { "^/api": "" },
				changeOrigin: true,
			},
		],
	},
};
