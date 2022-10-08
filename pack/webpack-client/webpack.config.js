// webpack is useful for bundling into a single file that older versions of node can use

// to install webpack and babel run
// npm install webpack-cli webpack babel-loader @babel/preset-env

const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');
module.exports = {
    mode: 'production',
    devtool: false,
    entry: ['fs.promises',"../../client/client"],
    name: 'main',
    target: 'node',
    output: {
        publicPath: './',
        path: path.resolve(__dirname, './packed'),
        filename: 'client.js',
    },
    node: {
        global: true,
        __filename: false,
        __dirname: false,
    },
    optimization: {
        minimize: false
    },
	plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: '../../client/config/default.yaml',to:"config/default.yaml"}
				
            ]
        })
    ],
	resolve: {
		alias: {
			[path.resolve(__dirname, "../../client/node_modules/config/parser.js")]: path.resolve(__dirname, "parser.fixed.js"),
		},
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						"presets": [
							["@babel/preset-env", {
								"useBuiltIns": "entry",
								"corejs": "3",
								"targets": {
								 	"node":8
								}
							},"stage-0"]
						],
						"plugins": [
						 	//"@babel/plugin-transform-spread",
						 	//"@babel/plugin-transform-classes",
							//["@babel/plugin-proposal-class-properties",{leagacy: true}], // never works
						]
					}
				}
			}
		]
	}
};

if(require.main === module) {
    webpack(module.exports, (err, stats) => { // Stats Object
        if(err || stats.hasErrors()) {
            // Handle errors here
        }
        // Done processing
    })
}
