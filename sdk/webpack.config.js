const path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const libraryName = "thingshub";

module.exports = {
	devtool: "source-map",
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),  
		filename: "thingshub.js",
		library: libraryName,
		libraryTarget: "umd",
		globalObject: "this" // Useful for node e DOM compatility
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
		new WebpackShellPluginNext({
			onBuildEnd: [".\\node_modules\\.bin\\dts-bundle-generator -o ./dist/thingshub.d.ts ./src/index.ts  --umd-module-name thingshub"]
		}),
		// ToDo: Not executed in correct order
		// Useful to avoid publish in npm repo
		new FileManagerPlugin({
			events: {
				onEnd: {
					copy: [
						{ source: "./dist/package.json", destination: "../clients/PeraColta/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/README.md", destination: "../clients/PeraColta/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/thingshub.js", destination: "../clients/PeraColta/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/thingshub.js.map", destination: "../clients/PeraColta/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/thingshub.d.ts", destination: "../clients/PeraColta/node_modules/thingshub-js-sdk/" },

						{ source: "./dist/package.json", destination: "../clients/ThingsMonitor/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/README.md", destination: "../clients/ThingsMonitor/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/thingshub.js", destination: "../clients/ThingsMonitor/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/thingshub.js.map", destination: "../clients/ThingsMonitor/node_modules/thingshub-js-sdk/" },
						{ source: "./dist/thingshub.d.ts", destination: "../clients/ThingsMonitor/node_modules/thingshub-js-sdk/" }
					]
				}
			}
		}),
	]
};
