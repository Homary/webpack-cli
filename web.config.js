module.exports = {
	entry: 'src/index.ts',
	rootID: 'app',
	extensions: ['.js', '.ts', '.tsx', '.less', '.css'],
	alias: {
		'@': 'src/'
	},
	server: {
		port: '3333'
    },
    vue: true,
    typescript: true,
    lazyLoading: true,
    splitCode: true,
};
