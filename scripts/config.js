const path = require('path');
const userConfig = require('../web.config');

function _join(filepath) {
	if (typeof filepath === 'string') {
		return path.join(__dirname, '../', filepath);
	}
	if (typeof filepath === 'object') {
		for (const key in filepath) {
			if (filepath.hasOwnProperty(key)) {
				filepath[key] = path.join(__dirname, '../', filepath[key]);
			}
		}

		return filepath;
	}
}

function multipagesPath(options) {
	let obj = Object.assign({}, options);

	for (let entry in obj) {
		for (let key in obj[entry]) {
			if (key === 'entry' || key === 'html') {
				obj[entry][key] = _join(obj[entry][key]);
			}
		}
	}
	return obj;
}

function aliasValue(alias) {
	for (let key in alias) {
		alias[key] = _join(alias[key]);
	}
	return alias;
}

module.exports = {
	base: {
		// 单页面入口文件
		entryDir: userConfig.entry ? _join(userConfig.entry) : '',

		// 发布路径
		outputDir: userConfig.outputPath
			? _join(userConfig.outputPath)
			: '../dist',

		// 默认生成html里div节点ID
		// 默认不设置值为app
		rootID: userConfig.rootID ? userConfig.rootID : 'app',

		title: userConfig.title ? userConfig.title : 'webpack-cli',

		// html文件模板路径
		html: userConfig.html ? userConfig.html : false,

		// 全局不打包文件目录,需配置默认html模板使用
		// 自定义html模板时,如果使用全局不打包的js需要手动插入
		globalConfig: userConfig.globalLib
			? {
					open: userConfig.globalLib.open,
					source: _join(userConfig.globalLib.source),
					targetDir: userConfig.globalLib.targetDir,
					externals: userConfig.globalLib.externals
						? userConfig.globalLib.externals
						: null
			  }
			: { open: false },

		// 多页
		multiPages: userConfig.multiPages
			? multipagesPath(userConfig.multiPages)
			: false,

		// devServer配置
		server: userConfig.server ? userConfig.server : {},

		// 省略后缀
		extensions: userConfig.extensions
			? userConfig.extensions
			: ['.js', '.json', '.less', '.css'],

		// alias
		alias: userConfig.alias
			? aliasValue(userConfig.alias)
			: {
					'@': _join('src')
			  },

		// 懒加载
		lazyLoading: userConfig.lazyLoading ? userConfig.lazyLoading : false
	},

	// less设置
	less: {
		// 是否引入less-plugin-functions
		lessFunction:
			userConfig.less && userConfig.less.lessFunction
				? userConfig.less.lessFunction
				: false,
		// common less file 公共less文件,不用引入即可使用
		// 不需要时设置为false
		lessCommon:
			userConfig.less && userConfig.less.lessCommon
				? _join(userConfig.less.lessCommon)
				: false
	},

	// vue options
	vue: {
		// 是否使用vue
		open: userConfig.vue ? userConfig.vue : false
	},

	// 项目中使用的框架,打包时会分割出来
	// 优先级按先后顺序
	libs: userConfig.splitCode || false,

	// 是否使用typescript
	typescript: {
		open: userConfig.typescript ? userConfig.typescript : false
	},

	// 是否使用react
	react: {
		open: userConfig.react ? userConfig.react : false
	},

	eslint: false
};
