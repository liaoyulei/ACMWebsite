//在这里处理主页(/index)方面的动态内容
var crypto = require('crypto');
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
		posts[2] = (await Post.get("member")).slice(0, 5);
		posts[3] = (await Post.get("teacher")).slice(0, 5);
		posts[4] = (await Post.get("solution")).slice(0,5);
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
				hint: "两次输入的密码不一致！"
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
					hint: "用户名已存在！"
				});
			}
			else {
				var err = await User.save(newUser);
				if (err) {
					await ctx.render('reg', {
						hint: "未知错误！"
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
		var md5 = crypto.createHash('md5');
		var password =  md5.update(ctx.request.body['password']).digest('base64');
		
		var user = await User.get(ctx.request.body['username']);
		if (!user) {
			await ctx.render('login', {
				hint: "用户不存在！"
			});
		}
		else if (user.password != password) {
			await ctx.render('login', {
				hint: "用户密码错误！"
			});
		}
		else{
			ctx.session.user = user;
			ctx.redirect('/index');
		}
	})
	
	.get("/logout", async(ctx) => {
		ctx.session.user = null;
		ctx.redirect('/index');
	})
	
	.get("/u", async(ctx) => {
		var posts = await Post.get(ctx.query['type']);
		if (ctx.query['id']) {
			for (var i=0;i<posts.length;++i) {
				if (posts[i]._id == ctx.query['id']) {
					posts[i].detail = posts[i].detail.replace(/ /g, "&ensp;");
					posts[i].detail = posts[i].detail.replace(/\t/g, "&emsp;");
					posts[i].detail = posts[i].detail.replace(/\r\n/g, "<br />");
				}
				else {
					posts[i].detail = null;
				}
			}
		}
		else {
			for (var i=0;i<posts.length;++i) {
				posts[i].detail = posts[i].detail.substring(0,200);
				posts[i].detail += "……";
			}
		}
		await ctx.render('u', {
			user: ctx.session.user,
			posts: posts
		});
	})
	
/*	.get("/user", async (ctx) => {
		if (ctx.session.user) {
			await ctx.render('user', {
				hint: "",
				user: ctx.session.user
			});
		} else {
			ctx.redirect('/login');
		}
	});
	
	.post("/user", async (ctx) => ) {
		var md5 = crypto.createHash('md5');
		var password = md5.update(ctx.request.body['passsword-old']).digest('base64');
		var user = await User.get(ctx.request.body['username']);
		if (user.password != password) {
			await ctx.render('user'), {
				hint: "原密码错误！",
				user: ctx.session.user
			});
		}
		else if (ctx.request.body['password-repeat'] != ctx.request.body['password-new']) {
			await ctx.render('reg', {
				hint: "两次输入的新密码不一致！",
				user: ctx.session.user
			});
		}
		//生成口令的散列
		else {
			user.password = md5.update(ctx.request.body['password-new']).digest('base64');
			else {
				var err = await User.save(newUser);
				if (err) {
					await ctx.render('reg', {
						hint: "未知错误！"
					});
				}
				else {
					ctx.session.user = newUser;
					ctx.redirect('/index');
				}
			}
		}
	}
	
	.get("/admin", async(ctx) => {
		await ctx.render('admin', {
			hint: ""
		});
	})
	
	.post("/admin", async(ctx) => {
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
				hint: "未知错误！"
			});
		}
		else {
			await ctx.render('admin', {
				hint: ""
			});
		}
	})*/
};
