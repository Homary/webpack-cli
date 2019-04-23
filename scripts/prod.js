const Config = require('webpack-chain');
const webpackConfig = new Config();
const base = require('./base');
const loaders = require('./loaders');
const files = require('./files');

webpackConfig
	.mode('production')
	
base(webpackConfig)
files(webpackConfig)
loaders(webpackConfig)

module.exports = webpackConfig.toConfig();