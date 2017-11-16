const path = require("path");

module.exports = {
	devtool: "source-map",
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),  
		filename: "thingshub-client-js.js",
		library: "ThingsHubClient"
	},
	externals:{
		"socket.io-client":"io"
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
	},
	module: {
		loaders: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: "ts-loader" }
		]
	}
};
