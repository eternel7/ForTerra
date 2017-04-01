var path = require( 'path' );
module.exports = {
    entry: "./src/js/index.js",
    output: {
        filename: "./js/app.bundle.js"
    },
    node: {
		fs: 'empty'
	},
	module: {
		loaders: [
			{
				test: /\.json$/,
				include: path.join(__dirname, 'node_modules'),
				loader: 'json',
			}
		]
	}
};