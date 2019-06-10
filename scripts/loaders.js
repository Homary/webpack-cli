const CONFIG = require('./config');
const api = require('./utils');

module.exports = webpackConfig => {

const isProd = webpackConfig.get('mode') === 'production';

	// CSS & Less Rule
 	function createCSSRule(lang, test, loader) {
		const baseRule = webpackConfig.module.rule(lang).test(test);

		baseRule
			.use('extract-css-loader')
			.loader(require('mini-css-extract-plugin').loader)
				.options({
					publicPath: '../'  //分离后CSS文件的打包位置
				})
			.end()
			.use('css-loader')
				.loader('css-loader')

		baseRule
			.use('postcss')
			.loader('postcss-loader')
			.options({ 
				plugins: [
					require('autoprefixer')()
				] 
			})

		if(loader === 'less-loader') {
		   const LessPluginFunctions = require('less-plugin-functions');
		   const lessFuncOptions = CONFIG.less.lessFunction ? 
				{
                    plugins: [ new LessPluginFunctions() ]
                } : {};

   			baseRule.use(loader)
					.loader(loader)
					.options(lessFuncOptions)

			const lessCommonOption = CONFIG.less.lessCommon;

			if(lessCommonOption) {
				baseRule.use('style-resources-loader')
					.loader('style-resources-loader')
					.options({ patterns: api.resolve(lessCommonOption) })
			}
		}
	}

	createCSSRule('css', /\.css$/);
	createCSSRule('less', /\.less$/, 'less-loader');

	// inject CSS extraction plugin
	webpackConfig
		.plugin('extract-css')
			.use(require('mini-css-extract-plugin'), [{ filename: 'css/[name].css' }])

	if(isProd) {	

		// minify extracted CSS
		const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
		const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

		webpackConfig
			.plugin('minify-css')
				.use(OptimizeCSSAssetsPlugin, [{
					assetNameRegExp: /\.less\.css$/g,
					cssProcessor: require('cssnano'),
					cssProcessorOptions: { discardComments: { removeAll: true } },
					canPrint: true
				}])
		webpackConfig.optimization
			.minimizer('css')
				.use(OptimizeCSSAssetsPlugin)

		//minify-uglify-js
		webpackConfig.optimization
			.minimizer('js')
				.use(UglifyJsPlugin, [{
					cache: true,
					parallel: true,
					sourceMap: false // set to true if you want JS source maps
				}])
	}

	// vue & tsx & jsx Rule
	function createJSRule(lang, test, loader, options={}, exclude=[], enforce) {
		const baseRule = webpackConfig.module.rule(lang).test(test);

		baseRule
			.use(loader)
			.loader(loader)
			.options(options)

		if(enforce) {
			baseRule.enforce(enforce);
		}
	}
	
	const isUseReact = CONFIG.react.open;
	const babelOptions =  isUseReact ? 
			{"presets": [ "@babel/preset-env", "@babel/preset-react" ]} 
            : {'presets': ['@babel/preset-env']}
    
    if (CONFIG.base.lazyLoading) {
        babelOptions['plugins'] = [
			'@babel/plugin-syntax-dynamic-import'
		];
    }
	
	let tsOptions = null;
	
	// vue
	const isUseVue = CONFIG.vue.open;

	if(isUseVue) {
		createJSRule('vue', /\.vue$/, 'vue-loader')

		webpackConfig.plugin('vue')
			.use( require('vue-loader/lib/plugin') )

		tsOptions = {
			appendTsSuffixTo: [/\.vue$/],
			reportFiles: ['src/**/*.{ts,tsx}']
		};
	}
	
	// ts
	const isUseTS = CONFIG.typescript.open;

	if( isUseTS ) {
		if(isUseVue) {
			createJSRule('vts', /\.tsx?$/, 'ts-loader', tsOptions)
        }
        if(isUseReact) {
			createJSRule(
				'tsx',
				/\.tsx?$/,
				'awesome-typescript-loader',
				{
					reportFiles: ['src/**/*.{ts,tsx}']
				}
			);
        }
        if(!isUseVue && !isUseReact) {
            createJSRule('ts', /\.ts$/, 'ts-loader');
        }
	}
    
	if( isUseReact && isUseTS) {
        createJSRule('js', /\.js$/, 'source-map-loader', {}, [], 'pre');
	}
    
    createJSRule('js', /\.jsx?$/, 'babel-loader', babelOptions)
    
	// split lib 分割框架  
    const libs = CONFIG.libs;
    
    if(libs) {
    
        webpackConfig.optimization.splitChunks({
            chunks: 'all',
            automaticNameDelimiter: '-',
			cacheGroups: {
				lib: {
					test: /[\\/]node_modules[\\/]/,
					priority: -10
				},
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true
				}
			}
        })
        .runtimeChunk({
            name: 'runtime'
        })
    }
}