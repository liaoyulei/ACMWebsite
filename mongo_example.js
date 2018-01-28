var MongoClient = require('mongodb').MongoClient;
var db;
module.exports = function(dbname, IP) {
	var exports = {};
	var DB_CONN_STR = `mongodb://${IP}:27017/${dbname}`;
	MongoClient.connect(DB_CONN_STR, async function(err, ddb) {
	    console.log("cl1连接成功！");
		db = ddb;
	});
	
	exports.get = function(key) { 
		return new Promise(async function(resolve, reject) { //get(key, maxAge, { rolling })
			var collection = db.collection('cl1');
			var result = await collection.find({key}).toArray();
			result = result[0].value;
			console.log("get",result);
			return resolve(result);
		});
	};

	exports.set = function(key, value) { 
		return new Promise(async function(resolve, reject) { //set(key, sess, maxAge, { rolling, changed })
			var collection = db.collection('cl1');
			await collection.remove({key});
			await collection.insert({key, value});
			return resolve();
		});
	};


	exports.destroy = function(key,value) { 
		return new Promise(async function(resolve, reject) { //set(key, sess, maxAge, { rolling, changed })
			var collection = db.collection('cl1');
			await collection.remove({key});
			return resolve();
		});
	};
	
	return exports;
}
