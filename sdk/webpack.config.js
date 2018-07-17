const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const libraryName = "thingshub";

module.exports = {
	devtool: "source-map",
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),  
		filename: "thingshub.js",
		library: libraryName,
		libraryTarget: "umd"
	},
	externals: {
		"socket.io-client": { 
			amd: "socket.io-client", 
			global: "io", // TODO: Can be unuseful?
			root: "io",
			commonjs: "socket.io-client", 
			commonjs2: "socket.io-client" 
		},
		"axios" : "axios"
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".webpack.js", ".web.js", ".js", ".ts", ".tsx"]
	},
	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: "ts-loader" }
		]
	},
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'dist/package.json', to : '../clients/TrackerApp/node_modules/thingshub-js-sdk/', force: true },
			{ from: 'dist/README.md', to : '../clients/TrackerApp/node_modules/thingshub-js-sdk/', force: true },
			{ from: 'dist/thingshub.js', to : '../clients/TrackerApp/node_modules/thingshub-js-sdk/', force: true },
			{ from: 'dist/thingshub.js.map', to : '../clients/TrackerApp/node_modules/thingshub-js-sdk/', force: true },
			{ from: 'dist/thingshub.d.ts', to : '../clients/TrackerApp/node_modules/thingshub-js-sdk/', force: true }
		],{})
	  ]
};
