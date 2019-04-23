## webpack-cli  
----

自定义`webpack`开发设置,调整所需的开发环境(`Vue`,`React`,`Ts`等)      

### Getting Started  
----

- 安装依赖  
```
npm install
```  

### Options  
----

编辑根目录下`web.config.js`  

```
module.exports = {
	...
}
``` 

|Name|Type|Default|Description|  
|:------:|:------:|:------:|:------:|  
| entry | {String} | '' | 入口文件 |  
| outputPath | {String} | /dist | 出口目录 |  
| title | {String} | 'webpack-cli' | html文件标题(不使用自定义html模板时) |  
| rootID | {String} | 'app' | div标签的ID(不使用自定义html模板时) |  
| extensions | {Array} | ['.js', '.css', 'json', '.less'] | 引用文件可省略的后缀,必须包含`.js` |  
| lazyLoading | {Boolean} | false | 懒加载 |  
| alias | {Object} | {'@/': '/src'} | 路径别名 |  
| html | {String} | '' | 自定义html模板路径 |  
| multiPages | {Object} | '' | 多页多入口文件 |  
| splitCode | {Boolean} | false | 是否需要分割代码, 默认打包为一个文件 |  
| vue | {Boolean} | false | 是否使用`vue` |  
| react | {Boolean} | false | 是否使用`react` |  
| typescript | {Boolean} | false | 是否使用`typescript` | 

- server {Object}  

`webpack-dev-server`的设置  

```
server: {
	port: '8080',
	host: '0.0.0.0',
	proxy: {

	},
	index: 'index.html',
	https: false/true,
	openPage: ''
}
```  

- globalLib {Object}  

不以`import`等模块化方式引入,需要以`script`或者`link`标签插入的文件  
如果在`多页环境`下需指明`chunks: {Array}`,即需要引入的页面   

```
globalLib: {
	open: false/true,
	source: {string} 文件目录路径, 
	targetDir: {string} 打包后文件目录名, 
    externals: { object } `webpack`中externals配置
}

// E.g

globalConfig: {
	open: true,
	source: 'src/lib/config.js', 
	targetDir: 'lib', 
    externals: {
            
        }
}
```  

- multiPages  

多页面,多入口设置  
设置了`multipages`则不可用在设置单独设置`entry`  

```
	multiPages: {
		index: {
			entry: {String} 入口文件},
			// 不需要引入的模块
			excludeChunks: ['login']
			// html: 如果使用自定义模板模板路径
		},

		// 入口名
		login: {

		}
	}
```  

- less  

`Less`相关配置  

```
	less: {
		// 引入less-plugin-functions
		lessFunction: false/true, 
		// common less file 公共less文件,不用引入即可使用
		// 不需要时设置为false
		lessCommon: {String} 
	}
```
  

> 使用`React`和`typescript`进行多页开发的`web.config.js`配置
----

```
module.exports = {
	multiPages: {
		index: {
			entry: 'src/index.tsx',
			excludeChunks: ['login']
		},
		login: {
			entry: 'src/login.tsx',
			excludeChunks: ['index']
		}
	},
	rootID: 'root',
	extensions: ['.js', '.ts', '.tsx', '.less'],
	libs: ['react', 'react-dom'],
	react: true,
	typescript: true,
	server: {
		port: '3333',
		index: 'login.html',
		openPage: 'index.html'
	}
}
```
### Features  
----

- [x] 支持单页面&多页面  
- [x] 支持以`<script>`插入`assets/config`文件下所有`js`到指定`html`  
- [x] `devServer`配置  
- [x] 支持`less`,自定义函数,全局`less`  
- [x] 支持`vue`,结合`TypeScript`(需要在`src`目录下新建`vue-shims.d.ts`)    
- [x] 支持`TypeScript`开发  
- [x] 支持自定义分割框架代码  
- [x] 支持文件复制  
- [x] 支持图片压缩以及转为`base64`  
- [x] 支持`react`  
- [ ] `eslint`      