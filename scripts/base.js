const path = require('path');
const fs = require('fs');
const CONFIG = require('./config');
const api = require('./utils');

const isMultiPages = CONFIG.base.multiPages && !CONFIG.base.entryDir;
const outputDir = api.resolve(CONFIG.base.outputDir);

module.exports = webpackConfig => {
	const isProd = webpackConfig.get('mode') === 'production';

	// analyer
	// webpackConfig.plugin('analyer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);

	// base entry & output
	// multiPages
	if (isMultiPages) {
		for (let key in CONFIG.base.multiPages) {
			webpackConfig
				.entry(key)
				.add(CONFIG.base.multiPages[key].entry)
				.end();
		}
	} else {
		if (typeof CONFIG.base.entryDir === 'string') {
			webpackConfig
				.entry('index')
				.add(CONFIG.base.entryDir)
				.end();
		}
		if (typeof CONFIG.base.entryDir === 'object') {
			for (let name in CONFIG.base.entryDir) {
				webpackConfig
					.entry(name)
					.add(CONFIG.base.entryDir[name])
					.end();
			}
		}
	}

	webpackConfig.output
		.path(outputDir)
		.filename('js/[name].[contenthash].js')
		.chunkFilename('js/[name].[chunkhash].js')
		// .libraryTarget('umd')
		// .umdNamedDefine(true)
		// .library('library');

	// clean
	const CleanWebpackPlugin = require('clean-webpack-plugin');

	webpackConfig.plugin('clean').use(CleanWebpackPlugin);

	// resolve HTML files(s)
	const HtmlWebpackPlugin = require('html-webpack-plugin');
	const isGlobalConfig = CONFIG.base.globalConfig.open;
	const globalConfigSource = CONFIG.base.globalConfig.source;
	const targetDir = CONFIG.base.globalConfig.targetDir;
	const localHtml = CONFIG.base.html ? CONFIG.base.html : false;

	const htmlOption = {};
	const htmlOptions = [];
	const htmlMergeOptions = {
		inject: false,
		appMountId: CONFIG.base.rootID ? CONFIG.base.rootID : 'app',
		title: CONFIG.base.title ? CONFIG.base.title : 'Webpack-cli',
		meta: [
			{
				name: 'viewport',
				content:
					'width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0'
			}
		],
		favicon: path.resolve(__dirname, '../favicon.ico')
	};
	const isProdHtml = {
		minify: isProd
			? {
					removeComments: true,
					collapseWhitespace: true,
					removeAttributeQuotes: false,
					collapseBooleanAttributes: true,
					removeScriptTypeAttributes: true
					// more CONFIG:
					// https://github.com/kangax/html-minifier#CONFIG-quick-reference
			  }
			: {}
	};

	if (isMultiPages) {
		const multiPages = CONFIG.base.multiPages;

		for (let key in multiPages) {
			let htmlOption = {};

			if (!multiPages[key].html) {
				htmlOption.template = require('html-webpack-template');
			} else {
				htmlOption.template = api.resolve(multiPages[key].html);
			}

			let isNeedScript = false;

			if (
				CONFIG.base.globalConfig.chunks &&
				CONFIG.base.globalConfig.chunks.includes(key)
			) {
				isNeedScript = true;
			}
			Object.assign(
				htmlOption,
				Object.assign(multiPages[key].html ? {} : htmlMergeOptions, {
					excludeChunks: multiPages[key].excludeChunks,
					filename: `${key}.html`
				}),
				isProdHtml,
				isNeedScript
					? {
							headHtmlSnippet: getConfigScript(
								globalConfigSource,
								`${targetDir}/`
							)
					  }
					: { headHtmlSnippet: undefined }
			);

			htmlOptions.push(htmlOption);
		}
		let _i = 0;

		for (let _page in multiPages) {
			webpackConfig
				.plugin(_page)
				.use(HtmlWebpackPlugin, [htmlOptions[_i++]]);
		}
	} else {
		if (localHtml) {
			htmlOption.template = path.join(__dirname, '../src/', localHtml);
		} else {
			htmlOption.template = require('html-webpack-template');
			Object.assign(
				htmlOption,
				htmlMergeOptions,
				isGlobalConfig
					? {
							headHtmlSnippet: getConfigScript(
								globalConfigSource,
								`${targetDir}/`
							)
					  }
					: {}
			);
		}

		Object.assign(htmlOption, isProdHtml);

		webpackConfig.plugin('html').use(HtmlWebpackPlugin, [htmlOption]);
	}

	/**
	 * 获取script标签字符串
	 * @param  {String} source    [源目标目录]
	 * @param  {[String]} targetDir [生成的文件夹]
	 * @return {[String]}           [指定文件夹下的文件的标签]
	 */
	function getConfigScript(source, targetDir) {
		if (!isGlobalConfig) {
			return undefined;
		}

		if (!targetDir.endsWith('/')) {
			targetDir = targetDir + '/';
        }
        
        if(targetDir === '/') {
            targetDir = './';
        }

		let configFiles = fs.readdirSync(path.resolve(__dirname, source), {});

		let jsFiles = configFiles.filter(file => {
			return file.endsWith('.js') !== -1;
		});
		let cssFiles = configFiles.filter(file => {
			return file.endsWith('.css');
		});

		let scripts = jsFiles.map(file => {
			return `<script src='${targetDir + file}'></script>`;
		});
		let links = cssFiles.map(link => {
			return `<link rel='stylesheet' href='${targetDir + link}' />`;
		});

		return links.concat(scripts).join('\n');
	}

	// copy assets file(s)
	const CopyWebpackPlugin = require('copy-webpack-plugin');

	const copyAssetsOptions = {
		from: path.resolve(__dirname, '../src/assets/'),
		toType: 'dir',
		ignore: ['*.md']
	};
	webpackConfig.plugin('copy').use(CopyWebpackPlugin, [[copyAssetsOptions]]);

	if (isGlobalConfig) {
		webpackConfig.plugin('copy-lib').use(CopyWebpackPlugin, [
			[
				{
					from: path.resolve(__dirname, '../', globalConfigSource),
					toType: 'dir',
					to: targetDir
				}
			]
		]);

		const isExternals = CONFIG.base.globalConfig.externals;

		if (isExternals) {
			webpackConfig.externals(isExternals);
		}
	}

	// extensions
	CONFIG.base.extensions.map(item => {
		webpackConfig.resolve.extensions.add(item);
	});

	// alias
	for (let key in CONFIG.base.alias) {
		let path = key.includes('/')
			? CONFIG.base.alias[key] + '/'
			: CONFIG.base.alias[key];
		webpackConfig.resolve.alias.set(key, path);
	}

	// dll
	// webpackConfig.plugin('dll').use(require('webpack/lib/DllPlugin.js'), [
	// 	{
	// 		context: __dirname,
	// 		path: path.resolve(__dirname, '../manifest.json'),
	// 		name: '[name]_[hash]'
	// 	}
	// ]);

	// webpackConfig.plugin('dllRef').use(require('webpack/lib/DllReferencePlugin.js'), [{
	//     context: __dirname,
	//     manifest: require('../manifest.json')
	// }])
};
