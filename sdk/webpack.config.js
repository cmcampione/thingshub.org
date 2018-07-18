const path = require("path");
const FileManagerPlugin = require("filemanager-webpack-plugin");

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
		new FileManagerPlugin({
			onEnd: {
				copy: [
					{ source: "./dist/package.json", destination: "../dummy/" },
					{ source: "./dist/README.md", destination: "../dummy/" },
					{ source: "./dist/thingshub.js", destination: "../dummy/" },
					{ source: "./dist/thingshub.js.map", destination: "../dummy/" },
					{ source: "./dist/thingshub.d.ts", destination: "../dummy/" }
				]
			}
		})
	]
};
