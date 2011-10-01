function NotImplementedException(){ };

var redis = require('redis-url').createClient(); //process.env.REDISTOGO_URL

//profiles of json format: {username:string,avatar_id:int,fb_id:int}

//callback for user profile takes args (profile,err)
exports.getUserProfile = function(username, cb) {
	redis.hgetall('user:' + username , 
			function(e,v) {
				var profile = v;
				profile.username = username;
				if (v.avatar_id == undefined) 
					profile = undefined;
				cb(profile, e);
			} );
	
}

//callback for user profile takes args (data,err)
exports.getFbUserProfile = function(fb_id, cb) {
	redis.hgetall('fbuser:' + fb_id , 
			function(e,v) {
				var profile = v;
				profile.fb_id = fb_id;
				if (v.avatar_id == undefined) 
					profile = undefined;
				cb(profile, e);
			} );
}

DEFAULT_AVATAR_ID = 0;
//returns True or False?
exports.createUserProfile = function(user_id, avatar_id, fb_id) {
	//user_id should be validated before creating profile
	
	if (avatar_id == undefined)
		avatar_id = DEFAULT_AVATAR_ID;
	if (user_id == undefined)
		return false;
	if (fb_id == undefined)
		fb_id = 0;
	
	redis.hmset(['user:' + user_id, 'avatar_id',avatar_id,'fb_id',fb_id]);
	if (fb_id != 0) {
		
		redis.hmset(['fbuser:' + fb_id,'username',user_id, 'avatar_id',avatar_id]);
	}
	
	return true; //should handle errors?
}

//cb is function(result) result is true or false
function validateUserId(user_id,cb) {
	//check length
	if (username.length == 0)
	 	cb(false);
	//check against db
	redis.exists('user:'+user_id,function(e,v){return v==1;})
}