var mongodb = require('./db');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};
module.exports = User;

User.save = function save(user) {
	return new Promise(function(resolve) {
		//存入 Mongodb 的文档
		mongodb.open(function(err, db) {
			if (err) {
				resolve(err);
				return;
			}
			//读取 User 集合
			db.collection('users', function(err, collection) {
				if (err) {
					mongodb.close();
					resolve(err);
					return;
				}
				//为 name 属性添加索引
				collection.ensureIndex('name', {unique: true});
				//写入 user 文档
				collection.insert(user, {safe: true}, function(err, user) {
					mongodb.close();
					resolve(err);
				});
			});
		});
	});
};

User.del = function del(username) {
	return new Promise(function(resolve) {
		mongodb.open(function(err, db) {
			if (err) {
				resolve(err);
				return;
			}
			db.collection('users', function(err, collection) {
				if (err) {
					resolve(err);
					return;
				}
				collection.remove({name: usename}, function(err, doc) {
					mongodb.close();
					resolve(err);
				});
			})
		});
	});
}

User.update = function update(user) {
	return new Promise(function(resolve) {
		mongodb.open(function(err, db) {
			if (err) {
				resolve(err);
				return;
			}
			db.collection('users', function(err, collection) {
				if (err) {
					resolve(err);
					return;
				}
				collection.save(user, function(err, doc) {
					mongodb.close();
					resolve(err);
				});
			});
		});
	});
}

User.get = function get(username) {
	return new Promise(function(resolve) {
		mongodb.open(function(err, db) {
			if (err) {
				resolve();
				return;
			}
			//读取 users 集合
			db.collection('users', function(err, collection) {
				if (err) {
					mongodb.close();
					resolve();
					return;
				}
				//查找 name 属性为 username 的文档
				collection.findOne({name: username}, function(err, doc) {
					mongodb.close();
					if (doc) {
						//封装文档为 User 对象
						resolve(doc);
					}
					else{
						resolve();
					}
				});
			});
		});
	});
};

