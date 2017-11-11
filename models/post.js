var mongodb = require('./db');

function Post(post) {
	this.title = post.title;
	this.meta = post.meta;
	this.time = post.time;
	this.detail = post.detail;
	this.type = post.type;
};
module.exports = Post;

Post.save = function save(post) {
	return new Promise(function(resolve) {
		//存入 Mongodb 的文档
		mongodb.open(function(err, db) {
			if (err) {
				resolve(err);
				return;
			}
			//读取 posts 集合
			db.collection('posts', function(err, collection) {
				if (err) {
					mongodb.close();
					resolve(err);
					return;
				}
				//为 type 属性添加索引
				collection.ensureIndex('type');
				//写入 user 文档
				collection.insert(post, {safe: true}, function(err, user) {
					mongodb.close();
					resolve();
				});
			});
		});
	});
};

Post.del = function del(postid) {
	return new Promise(function(resolve) {
		mongodb.open(function(err, db) {
			if (err) {
				resolve(err);
				return;
			}
			db.collection('posts', function(err, collection) {
				if (err) {
					resolve(err);
					return;
				}
				collection.remove({_id: postid}, function(err, doc) {
					mongodb.close();
					resolve(err);
				});
			});
		});
	});
}

Post.update = function update(post) {
	return new Promise(function(resolve) {
		mongodb.open(function(err, db) {
			if (err) {
				resolve(err);
				return;
			}
			db.collection('posts', function(err, collection) {
				if (err) {
					resolve(err);
					return;
				}
				collection.save(post, function(err, doc) {
					mongodb.close();
					resolve(err);
				});
			});
		});
	});
}

Post.get = function get(type) {
	return new Promise(function(resolve) {
		mongodb.open(function(err, db) {
			if (err) {
				resolve();
				return;
			}
			//读取 posts 集合
			db.collection('posts', function(err, collection) {
				if (err) {
					mongodb.close();
					resolve();
					return;
				}
				//查找 type 属性为 type 的文档
				var query = {};
				if (type) {
					query.type = type;
				}
				collection.find(query).sort({_id: -1}).toArray(function(err, docs) {
					mongodb.close();
					if (err) {
						resolve();
						return;
					}
					//封装 posts 为 Post 对象
					var posts = [];
					docs.forEach(function(doc, index) {
						posts.push(doc);
					});
					resolve(posts);
				});
			});
		});
	});
};
