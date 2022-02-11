module.exports = {
	configureWebpack: {
		optimization: {
			splitChunks: false,
			minimize: false
		},
		plugins:[],
	},
	pages: {
		index: {
			name: "System Monitor",
			entry: 'main.js',
			template: 'public/index.html',
		}
	},
	css:{
		extract:false
	},
	publicPath:"",
	filenameHashing:false
}