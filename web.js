function NotImplementedException(){ };


ROOM_EMPTY = 0;
ROOM_OCCUPIED = 1;
WALL_HEIGHT = 6; //TODO VERIFY
NORTH = 'N';
SOUTH = 'S';
EAST = 'E';
WEST = 'W';
MAX_CLIENTS = 10;

function RoomMap(params) {
	// Clients are not notified of changes to the map through calls to member functions.
	// That happens in sendUserAction, which calls the member functions
	console.log('in room')
	this.width = params.width;
	this.height = params.height;
	this.floorObjects = params.floorObjects;
	this.wallObjects = params.wallObjects;
	
	//init floor matrix
	floorMatrix = [];
	for (var i=0; i<this.width * this.height; i++) {
		floorMatrix.push(ROOM_EMPTY);
	}
	//init wall matrix
	wallMatrix = [];
	for (var i=0; i<this.width * WALL_HEIGHT; i++) {
		wallMatrix.push(ROOM_EMPTY);
	}
	
	//TODO add objects to floor
	//throw NotImplementedException();
	//TODO add objects to wall
	//throw NotImplementedException();
	
	//init clients
	clients = {}; //indexed by username
	this.numClients = 0;

	// spawn a new client
	this.spawn = function(who,x,y) {
		//add to clients array
		//update map
		client ={username:who,x:x,y:y};
		clients['who'] = client;

		this.numClients++;
		return true;
	}
	
	this.getUsers = function() {
		users = [];
		for (name in clients) {
			users.push(clients[name]);
		}
		return users;
	}
	
	// return True or False
	this.leave = function(who)
	{
		
		this.numClients--;
		return true;
	}
	
	// return True if the move is Legal, false otherwise
	this.isLegalMove = function(who,dir) {
		if (clients[who] == undefined)
			return False;
		else {
			var client = clients[who];
			var x = client.x;
			var y = client.y;
			var mPos = getMovePos(x,y,dir);
			if (mPos<0 || mPos > floorMatrix.length || this.isOccupied(x,y) )
				return false;
			else
				return true;
		}
	}
	
	
	// move the specified client in the direction, return True or False
	this.move = function(who, dir) 
	{
		
		
		var client = clients[who];
		
		if (client == undefined)
			return false; //TODO
		
		var x = client.x;
		var y = client.y;
		var pos = getPos(x,y);
		var mPos = getMovePos(x,y,dir);
		floorMatrix[mPos] = FLOOR_OCCUPIED;
		floorMatrix[pos] = FLOOR_EMPTY;
		client.dir = dir;
		
		return True;
	}
	
	//return True or False
	this.look = function(who,dir){
		var client = clients[who];
		client.dir = dir;
	}
	
	this.setPos = function(who, x, y) {
		var client = clients[who];
		var oldx = client.x;
		var oldy = client.y;
		client.x = x;
		client.y = y;
		floorMatrix[getPos(x,y)=FLOOR_OCCUPIED];
		floorMatrix[getPos(oldx,oldy)=FLOOR_EMPTY];
		
		return true;
	}
	
	this.isOccupied = function(x,y) {
		var pos = getPos(x,y);
		return (pos == ROOM_EMPTY);		
	}
	
	// returns [x,y]
	this.getEmptyPos = function() {
		while (true) {
			var pos = Math.floor(Math.random()*floorMatrix.length);
			var x = pos & this.width;
			var y = Math.floor(pos/this.width);
			if (!this.isOccupied(x,y)) {
				return [x,y];
			}
		}
	}
	
	function getPos(x,y) { 
		return y*this.width + x; 
	}
	
	function getMovePos(x,y,dir) {
		switch (dir) {
			case NORTH: 
				return getPos(x,y-1);
				break;
			case SOUTH: break;
				return getPos(x,y+1);
			case EAST: break;
				return getPos(x+1,y);
			case WEST: break;
				return getPos(x-1,y);
		}
	}
}




var express = require('express');
var nowjs = require("now");
var redis = require('redis-url').createClient(); //process.env.REDISTOGO_URL
var room = require('./room.js')
var auth = require('./auth.js')

var app = express.createServer(express.logger(),
				express.static(__dirname + '/public'));
var everyone = nowjs.initialize(app);

//now.js test
everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage('name', message.text);
};

//end now.js test

app.configure(function() {
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
});

var title;
redis.get('title',function(err,val) { title=val; });

app.get('/', function(req,res) {
    res.render('index.jade',{title: title});
});
app.get('/room', function(req,res) {
    res.render('room.jade',{title: title});
});
app.get('/test', function(req,res) {
    res.render('test.jade',{title: title});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

function Avatar(params) {
	throw NotImplementedException();
}

// function Client(params) {
// 	this.profile = 
// 	this.x = params.x;
// 	this.y = params.y;
// 	this.avatar = params.avatar;
// }


//TODO init roomMap
var params={width:16,params:16,floorObjects:[],wallObjects:[]}
var roomMap = new RoomMap(params); //TODO TEMP this is not how it will really work
console.log("MADE ROOM");
console.log(roomMap.width);

function getRoom() {return roomMap;}

everyone.now.requestRoomData = function(cb) { //EVENTUALLY will have room id parameter
    //retrieve room data hash
    //retrieve cell list
    //retrieve wall object list
    //return {
    
    //client function
    //everyone.now.receiveRoomData(data,err);
	var users = getRoom().getUsers();
	cb({name:'1st room',users:users});
}

everyone.now.sendUserAction = function(data) {
    /*
    ACTION FORMAT (JSON)
    {
		userID: string, 
		action: string,
		params: object,
		timestamp: number  
    }
    ACTIONS: params
    move    :  dir (N|S|E|W) string
    say     :  message string
    spawn   :  x,y,dir(optional)
    leave   :  
    look    :  dir (N|S|E|W)
    setpos  : x,y,dir(optional)
    */
	//action = lcase(action)
	
	var userID = data.userID;
	if (userID == undefined) {
		err = 'no user ID specified';
	} else if (data.params == undefined) { 
		err = 'no parameters specified';
	} else {	
		var params = data.params;
		var action = data.action;
		var err = undefined;
		var timestamp = new Date().getTime();
		//TODO check if request is too old?
		var res = {userID: userID, action: action, timestamp:timestamp};
		
   		switch (data.action)
    	{
			case 'move':
				// var userID = data.userID;
				// 				var dir = data.params.dir;
				// 				//check legal move
				// 				if (roomMap.isLegalMove(userID,dir)) {
				// 					room.move(userID,dir);
				// 					res.params = {dir: dir}
				// 				} else {
				// 					err = 'illegal move';
				// 				}	

				//TEST SKIP ALL VALIDATION TODO
				var dir = data.params.dir;
				roomMap.move(userID,dir);
				res.params = {dir: dir}
				break;
			case 'say':
				res = data;
				res.timestamp = timestamp;				
				//check message?
				if (typeof(res.params.message) != 'string')	{ 
					err = 'invalid message';
				}
				
				break;
			case 'spawn':
				// if (roomMap.numClients >= MAX_CLIENTS) {
				// 					err = 'too many clients';
				// 				} else {
				// 					var pos = roomMap.getEmptyPos();
				// 					var x=pos[0], y = pos[1];
				// 					if (roomMap.spawn(userID,x,y)) {
				// 						res.params = {dir:SOUTH, x:x, y:y};
				// 					} else {
				// 						err = 'failed to spawn';
				// 					}
				// 				}
				
				//TEST SKIP ALL VALIDATION TODO
				getRoom().spawn(userID,0,0);
				res.params={dir:SOUTH,x:0,y:0};
				
				break;
			case 'leave':
				if (!roomMap.leave(userID)) {
					err = 'failed to leave';
				}
				break;
			case 'look':
				if (params.dir == undefined) {
					err = 'look direction not specified';
				} else {
					if (!roomMap.look(userID,params.dir)) {
						err = 'error looking';
					} else {
						res.params = {dir:params.dir}
					}
				}
				break;
			case 'setpos':
				var x = params.x;
				var y = params.y;
				if (roomMap.isOccupied(x,y)) {
					err = 'position is occupied';
				} else {
					roomMap.setPos(userID,x,y);
					res.params = params;
				}
				break;
			default:
	        	err = 'Illegal Action';
				break;
    	}
	}
	everyone.now.receiveUserAction(res, err);
}


