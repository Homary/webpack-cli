module.exports = {
    entry: 'src/index.js',
    html: 'assets/index.html',
	extensions: ['.js', '.ts', '.tsx', '.less', '.css'],
	alias: {
		'@': '.src/'
	},
	server: {
		port: '3333'
	}
};
