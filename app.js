const session = require('koa-session');
const Koa = require('koa');
const app = new Koa();
var router = require('koa-router')();
//var MongoStore = require('connect-mongo');
var settings = require('./settings');

(async() => {
	//设置模板引擎(模板引擎与views文件夹及ctx.render相关)
	require('koa-ejs')(app, {
	  root: require("path").join(__dirname, 'templets'),
	  layout: false,
	  viewExt: 'ejs',
	  cache: false,
	  debug: false
	});
	//启动
	//静态文件目录
	app.use(require('koa-static')("statics"));
	//解析URL参数
	app.use(require('koa-bodyparser')());
	//添加自定义路由
	await require("./dymatic/index.js")({app, router});
	app  
		.use(router.routes())
		.use(router.allowedMethods());
	app.use(session({
		key: 'koa: sess',
		maxAge: 86400000,
		overwrite: true,
		httpOnly: true,
		signed: true,
		rolling: false,
	//	store: require("./mongo_example")(settings.db, settings.host)
	}, app));
	app.listen(3000);
})();
