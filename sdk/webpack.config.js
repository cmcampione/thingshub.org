const path = require("path");

const libraryName = "thingshub";

module.exports = {
	devtool: "source-map",
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),  
		filename: "thingshub.js",
		library: libraryName
	},
	externals:{
		"socket.io-client": "io",
		"axios" : "axios"
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".webpack.js", ".web.js", ".js", ".ts", ".tsx"]
	},	
	module: {
		loaders: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: "ts-loader" }
		]
	}/* ,
	plugins: [new DtsBundlePlugin()] */
};

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function (compiler) {
	compiler.plugin("done", function(){
		var dts = require("dts-bundle");

		dts.bundle({
			name: libraryName,
			main: "dist/sdk/src/index.d.ts",
			out: "../../dist/index.d.ts",
			removeSource: true ,
			outputAsModuleFolder: true // to use npm in-package typings
		});
	});
};
