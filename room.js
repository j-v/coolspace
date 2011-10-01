ROOM_EMPTY = 0;
ROOM_OCCUPIED = 1;
WALL_HEIGHT = 6; //TODO VERIFY
NORTH = 'N';
SOUTH = 'S';
EAST = 'E';
WEST = 'W';
MAX_CLIENTS = 10;


exports.RoomMap = function(params) {
	// Clients are not notified of changes to the map through calls to member functions.
	// That happens in sendUserAction, which calls the member functions
	
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

