const path = require('path');

module.exports = {
	resolve(fileDir) {
		if(typeof fileDir !== 'String') {
			return;
		}
		return path.resolve(__dirname, fileDir);
	}
}