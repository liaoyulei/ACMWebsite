var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
module.exports = function(dbname, IP) {
	var exports = {};
	var DB_CONN_STR = `mongodb://${IP}:27017/${dbname}`;
	MongoClient.connect(DB_CONN_STR, async function(err, ddb) {
	    console.log("posts连接成功！");
		db = ddb;
	});
	
	exports.get = function(type) {
		return new Promise(async function(resolve, reject) {
			var collection = db.collection('posts');
			var results = await collection.find({type: type}).sort({_id: -1}).toArray();
			var posts = [];
			results.forEach(function(result, index) {
				posts.push(result);
			});
			return resolve(posts);
		});
	};
	
	exports.set = function(post) {
		return new Promise(async function(resolve, reject) {
			var collection = db.collection('posts');
			if(post._id) {
				await collection.remove({_id: ObjectId(post._id)});
				delete post._id;
			}
			await collection.ensureIndex('type');
			await collection.insert(post, {safe: true});
			return resolve();
		});
	};
	
	exports.destroy = function(postid) {
		return new Promise(async function(resolve, reject) {
			var collection = db.collection('posts');
			await collection.remove({_id: ObjectId(postid)});
			return resolve();
		});
	};
	
	return exports;
}
