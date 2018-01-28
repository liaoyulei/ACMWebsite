var MongoClient = require('mongodb').MongoClient;
var db;
module.exports = function(dbname, IP) {
	var exports = {};
	var DB_CONN_STR = `mongodb://${IP}:27017/${dbname}`;
	MongoClient.connect(DB_CONN_STR, async function(err, ddb) {
	    console.log("users连接成功！");
		db = ddb;
	});
	
	exports.get = function(username) {
		return new Promise(async function(resolve, reject) {
			var collection = db.collection('users');
			var result = await collection.findOne({name: username}, {_id: 0});
			return resolve(result);
		});
	};
	
	exports.set = function(user) {
		return new Promise(async function(resolve, reject) {
			var collection = db.collection('users');
			await collection.remove({name: user.name});
			await collection.ensureIndex('name', {unique: true});
			await collection.insert(user, {safe: 'true'});
			return resolve();
		});
	};
	
	exports.destroy = function(username) {
		return new Promise(async function(resolve, reject) {
			var collection = db.collection('users');
			await collection.remove({name: username});
			return resolve();
		});
	};
	
	return exports;
}
