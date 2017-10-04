const session = require('koa-session');
const Koa = require('koa');
const app = new Koa();

var router = require('koa-router')();

var MongoStore = require('connect-mongo');
var settings = require('./settings.js');
var User = require('./models/user');
	
(async() =>
{
	//设置模板引擎(模板引擎与views文件夹及ctx.render相关)
	require('koa-ejs')(app, {
	  root: require("path").join(__dirname, 'templets'),
	  layout: false,
	  viewExt: 'ejs',
	  cache: false,
	  debug: false
	});

	//静态文件目录
		app.use(require('koa-static')("statics"));
	//解析URL参数
		app.use(require('koa-bodyparser')());

	
	//添加自定义路由
	await require("./dymatic/index.js")({app, router});
	//启动
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
/*		store:{
			get:function(key, maxAge, opt) {
				console.log(key);
				console.log(maxAge);
				console.log(opt);
				mongodb.open(function(err, db) {
					if (err) {
						return;
					}
					console.log("open");
					db.collection('session', function(err, collection) {
						if (err) {
							mongodb.close();
							return;
						}
						console.log("session");
						collction.findOne({name: key}, function(err, doc) {
							mongodb.close();
							return (new User(doc));
						});
					});
				});
			},
			set:function(key, value, maxAge, opt) {
				mongodb.open(function(resolve) {
					mongodb.open(function(err, db) {
						if (err) {
							return;
						}
						db.collection('session', function(err, collection) {
							if (err) {
								mongodb.close();
								return;
							}
							collection.ensureIndex('name', {unique: true});
							collection.insert(value, {safe: true}, function(err, value) {
								mongodb.close();
							});
						}); 
					});
				});
			},
			destroy:function(key) {}
		}*/
	}, app));
	app.listen(3000);
})();