//在这里处理主页(/index)方面的动态内容
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = require('../models/user');
var Post = require('../models/post');

module.exports = async(args) => {
	args.router
    .redirect('/', '/index')
    .get("/index", async(ctx) => {
		var args = [], posts = [];
		for (var i=0;i<14;++i) {
			args.push({url:`/images/${i}.jpg`});
		}
		posts[0] = (await Post.get("news")).slice(0, 5);
		posts[1] = (await Post.get("acm")).slice(0, 5);
		posts[2] = (await Post.get("rucacm")).slice(0, 5);
		posts[3] = (await Post.get("member")).slice(0, 5);
		posts[4] = (await Post.get("teacher")).slice(0, 5);
		posts[5] = (await Post.get("solution")).slice(0,5);
		await ctx.render('index', {
			user: ctx.session.user,
			image_views: args,
			posts: posts
		});
    })
	
	.get("/reg", async(ctx) => {
		await ctx.render('reg', {
			hint: ""
		});
	})
	
	.post("/reg", async(ctx) => {
		if (ctx.request.body['password-repeat'] != ctx.request.body['password']) {
			await ctx.render('reg', {
				hint: "两次输入的密码不一致"
			});
		}
		//生成口令的散列
		else {
			var md5 = crypto.createHash('md5');
			var password = md5.update(ctx.request.body['password']).digest('base64');
			var newUser = new User({
				name: ctx.request.body['username'],
				password: password,
				email: ctx.request.body['email'],
			});
			//检查用户名是否已经存在
			var user = await User.get(newUser.name);
			if (user) {
				await ctx.render('reg', {
					hint: "用户名已存在"
				});
			}
			else {
				var err = await User.save(newUser);
				if (err) {
					await ctx.render('reg', {
						hint: "未知错误，请稍候重试"
					});
				}
				else {
					ctx.session.user = newUser;
					ctx.redirect('/index');
				}
			}
		}
	})
	
	.get("/login", async(ctx) => {
		await ctx.render('login', {
			hint: ""
		});
	})
	
	.post("/login", async(ctx) => {
		var user = await User.get(ctx.request.body['username']);
		if (!user) {
			await ctx.render('login', {
				hint: "用户不存在"
			});
		}
		else if (ctx.request.body['submit'] == "forget") {
			var transport = nodemailer.createTransport({  
                host: "smtp.ruc.edu.cn",  
                secureConnection : true, // use SSL  
                port: 465, // port for secure SMTP  
                auth : {  
                    user : "2015201953@ruc.edu.cn",  
                    pass : "lyl123456"
                }
            });  
			var newusession = "";
			for (var i = 0; i < 12; ++i) {
				newusession += Math.floor(Math.random() * 10);
			}
			transport.sendMail({  
                from: "2015201953@ruc.edu.cn",  
                to: user.email,
                subject: "RUC_ACM用户密码找回",  
                generateTextFromHTML: true,
                html: "用户:" + user.name 
						+ "，请点击（复制）此链接进行密码更新:<a href=http://"  
                        + ctx.headers.host + "/forget?usename=" + user.name + "&usession="  
                        + newusession + "  >" + ctx.headers.host  
                        + "/forget?usename=" + user.name + "&usession=" + newusession  
                        + "</a>。如果链接失效，请重试。"  
            }, function(error, response) { 
				transport.close();
            });
			ctx.session.usession = newusession;
			await ctx.render('login', {
				hint: "请进入您的邮箱" + user.email.slice(0, 1) + "*****" + user.email.slice(user.email.indexOf('@')) + "查收邮件"
			});
		} 
		else if (ctx.request.body['submit'] == "login") {
			var md5 = crypto.createHash('md5');
			var password =  md5.update(ctx.request.body['password']).digest('base64');
			if (user.password != password) {
				await ctx.render('login', {
					hint: "用户密码错误"
				});
			}
			else{
				ctx.session.user = user;
				ctx.redirect('/index');
			}
		}
	})
	
	.get("/forget", async(ctx) => {
		var user = await User.get(ctx.query['usename']);
		if (user && ctx.query['usession'] == ctx.session.usession) {
			await ctx.render('forget', {
				hint: "",
				user: user
			});
		}
	})
	
	.post("/forget", async(ctx) => {
		var user = await User.get(ctx.request.body['username']);
		if (ctx.request.body['password-repeat'] != ctx.request.body['password']) {
			await ctx.render('reg', {
				hint: "两次输入的密码不一致",
				user: user
			});
		}
		//生成口令的散列
		else {
			var md5 = crypto.createHash('md5');
			user.password = md5.update(ctx.request.body['password']).digest('base64');
			var err = await User.update(user);
			if (err) {
				await ctx.render('/forget', {
					hint: "未知错误，请稍候重试",
					user: user
				});
			}
			else {
				ctx.redirect('/login');
			}
		}
	})
	
	.get("/logout", async(ctx) => {
		ctx.session.user = null;
		ctx.redirect('/index');
	})
	
	.get("/u", async(ctx) => {
		var posts = await Post.get(ctx.query['type']);
		if (ctx.query['id']) {
			for (var i = 0; i < posts.length; ++i) {
				if (posts[i]._id != ctx.query['id']) {
					posts[i].detail = null;
				}
			}
		}
		else {
			for (var i=0;i<posts.length;++i) {
				posts[i].detail = posts[i].detail.substring(0,50);
				posts[i].detail += "……";
			}
		}
		await ctx.render('u', {
			user: ctx.session.user,
			posts: posts
		});
	})
	
	.get("/user", async (ctx) => {
		if (ctx.session.user) {
			await ctx.render('user', {
				hint: "",
				user: ctx.session.user
			});
		}
		else {
			ctx.redirect('/login');
		}
	})
	
	.post("/user", async (ctx) => {
		var md5 = crypto.createHash('md5');
		var password = md5.update(ctx.request.body['passsword-old']).digest('base64');
		var user = await User.get(ctx.request.body['username']);
		if (user.password != password) {
			await ctx.render('user', {
				hint: "原密码错误",
				user: ctx.session.user
			});
		}
		else if (ctx.request.body['password-repeat'] != ctx.request.body['password-new']) {
			await ctx.render('user', {
				hint: "两次输入的新密码不一致",
				user: user
			});
		}
		//生成口令的散列
		else {
			user.password = md5.update(ctx.request.body['password-new']).digest('base64');
			var err = await User.update(user);
			if (err) {
				await ctx.render('user', {
					hint: "未知错误，请稍候重试"
				});
			}
			else {
				ctx.session.user = newUser;
				ctx.redirect('/login');
			}
		}
	})
	
/*	.get("/admin", async (ctx) => {
		await ctx.render('admin', {
			hint: ""
		});
	})*/
	
/*	.post("/admin", async(ctx) => {
		var time = new Date();
		var newPost = new Post({
			title: ctx.request.body['title'],
			meta: ctx.request.body['meta'],
			time: time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate(),
			detail: ctx.request.body['detail'],
			type: ctx.request.body['type'],
		});
		var err = await Post.save(newPost);
		if (err) {
			await ctx.render('admin', {
				hint: "未知错误，请稍候重试"
			});
		}
		else {
			await ctx.render('admin', {
				hint: ""
			});
		}
	})*/
};
