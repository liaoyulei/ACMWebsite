//�����ﴦ����ҳ(/index)����Ķ�̬����
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
				hint: "������������벻һ�£�"
			});
		}
		//���ɿ����ɢ��
		else {
			var md5 = crypto.createHash('md5');
			var password = md5.update(ctx.request.body['password']).digest('base64');
			var newUser = new User({
				name: ctx.request.body['username'],
				password: password,
				email: ctx.request.body['email'],
			});
			//����û����Ƿ��Ѿ�����
			var user = await User.get(newUser.name);
			if (user) {
				await ctx.render('reg', {
					hint: "�û����Ѵ��ڣ�"
				});
			}
			else {
				var err = await User.save(newUser);
				if (err) {
					await ctx.render('reg', {
						hint: "δ֪����"
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
				hint: "�û������ڣ�"
			});
		}
		else if (user.password != password) {
			await ctx.render('login', {
				hint: "�û��������"
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
				posts[i].detail += "����";
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
				hint: "ԭ�������",
				user: ctx.session.user
			});
		}
		else if (ctx.request.body['password-repeat'] != ctx.request.body['password-new']) {
			await ctx.render('reg', {
				hint: "��������������벻һ�£�",
				user: ctx.session.user
			});
		}
		//���ɿ����ɢ��
		else {
			user.password = md5.update(ctx.request.body['password-new']).digest('base64');
			else {
				var err = await User.save(newUser);
				if (err) {
					await ctx.render('reg', {
						hint: "δ֪����"
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
				hint: "δ֪����"
			});
		}
		else {
			await ctx.render('admin', {
				hint: ""
			});
		}
	})*/
};
