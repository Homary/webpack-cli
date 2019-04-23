
module.exports = webpackConfig => {
	webpackConfig.module.rule()
		.test(/\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf)$/)
			.use('url-loader')
			.loader('url-loader')
			.options({ 
				limit:  8192, 
				name: 'img/[name].[ext]'
			})
			.end()
	
	const imageMinWebpackPlugin = require('imagemin-webpack-plugin').default;	

	webpackConfig
		.plugin('imagemin')
		.use(imageMinWebpackPlugin, [{
			test: /\.(jpe?g|png|gif|svg)$/i,
			disable: webpackConfig.get('mode') !== 'production',
			pngquant: {
				quality: '60-80'
			}
		}])
		.end()
		.plugin('default-imagemin')
		.use(imageMinWebpackPlugin, [{test: '../src/assets/img/**'}])
}