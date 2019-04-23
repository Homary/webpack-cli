const Config = require('webpack-chain');
const webpackConfig = new Config();
const base = require('./base');
const loaders = require('./loaders');
const options = require('./config');
const files = require('./files');

webpackConfig
	.mode('development')

base(webpackConfig);
files(webpackConfig);
loaders(webpackConfig);

// devServer
const {
	port =  8080,
	host =  'localhost',
	index =  'index.html',
	https = false,
	proxy = {},
	openPage
} = options.base.server;

webpackConfig.devServer
	.port(port)
	.host(host)
	.proxy(proxy)
	.https(https)
	.openPage(openPage)

webpackConfig.devServer.set('index', index);

module.exports = webpackConfig.toConfig();