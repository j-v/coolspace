NORTH = 'N';
SOUTH = 'S';
EAST = 'E';
WEST = 'W';

//$(init);
now.ready(init);
var isRoomDataReceived = false;

var gridSize = 60;
var wall;
var floor;
var userID = "user" + Math.random();
function init() {

	wall = new WallMap('#map-container');
	floor = new FloorMap('#map-container');
	floor.addFurniture(7, 1, 2, 1, "couch.png");
	floor.addFurniture(0, 4, 2, 1, "box.png");
	floor.addFurniture(7, 4, 1, 1, "cards.png");
	floor.addFurniture(4, 3, 2, 1, "octopus.png");

	//floor.addFurniture();
	
	//floor.addPlayerAvatar(4,1, "user1", "avatar.png");
	//floor.addAvatar(5,1, "user2", "avatar.png");
	
	var chatinput = $('#chatinput');
	var chatform = $('#chat');
	
	chatform.submit(function(ev) {	
		ev.preventDefault();
		if (!floor.playerAvatar) return;
		var message = chatinput.val();
		if (message.length > 0) {
			chatinput.val("");
			sendActionSay(message);
		}
	});
	
	joinRoomRequest(userID);

}

function WallMap (container) {
	this.init = function() {
		this.container = container;
		this.xdim = 10;
		this.ydim = 2;

		
		this.elem = $('<div class="wall">').appendTo(container).css({
			"width": this.xdim * gridSize,
			"height": this.ydim * gridSize
		});		
	};
	


	this.init();
}


function FloorMap (container) {
	this.init = function() {
	
		this.objects = [];
		
		this.xdim = 10;
		this.ydim = 6;

		this.elem = $('<div class="floor">').appendTo(container).css({
			"width": this.xdim * gridSize,
			"height": this.ydim * gridSize
		});


		this.avatars = {};

		this.furniture = [];

		this.elem.click($.proxy(this, "click"));		
		this.playerAvatar = null;
	};
	
	this.addFurniture = function(x, y, xdim, ydim, image) {
		var f = new Furniture(this);
		f.x = x;
		f.y = y;
		f.xdim = xdim;
		f.ydim = ydim;
		f.image = image;
		this.furniture.push(f);
		this.objects.push(f);
		f.update();
	}
	
	this.getBlockedCells = function() {
		var cells = [];
		for (var i = 0; i < this.objects.length; i++) {
			var f = this.objects[i];
			for (var x = 0; x < f.xdim; x++) {
				for (var y = 0; y < f.ydim; y++) {
					cells.push({x: f.x + x, y: f.y + y});
				}
			}
		}
		for (var j in this.avatars) {
			var a = this.avatars[j];
			cells.push({x: a.x, y: a.y});
		}
		return cells;
	
	};
	this.addPlayerAvatar = function(x, y, id, image) {
		console.log("adding player");
		if (this.playerAvatar) throw "Player avatar already exists";
		this.playerAvatar = this.addAvatar(x, y, id, image);
	};
	
	this.addAvatar = function(x, y, id, image) {
		console.log("avatar added");
		var av = new Avatar(this);
		av.x = x;
		av.y = y;
		av.id = id;
		av.xdim = 1;
		av.ydim = 1;
		av.heightmodifier = gridSize/2;
		av.image = image;


		this.avatars[id] = av;
		av.update();
		return av;
	};

	
	this.isCellTraversable = function(x, y) {
		var blocked = this.getBlockedCells();
		for (var i = 0; i < blocked.length; i++) {
			if (blocked[i].x == x && blocked[i].y == y) return false;
		}
		return true;	
	};
	
	this.isCellWithinBounds = function(x, y) {
		return x >= 0 && y >= 0 && x < this.xdim && y < this.ydim;
	}
	
	this.click = function(event) {
		if (!this.playerAvatar) return;
		if (this.playerAvatar.inTransit) return;
	
		// Get xy of click relative to the element
		var offset = this.elem.offset();
		var ax = this.playerAvatar.x;
		var ay = this.playerAvatar.y;
		var x = event.pageX - offset.left - ((ax + 0.5) * gridSize); //- this.mapElem.offsetLeft;
		var y = event.pageY - offset.top - ((ay + 0.5) * gridSize);
		var dir = null;
		if (x > y) {
			if (x + y > 0) { 
				// East
				dir = EAST;
				ax++;
			} else {
				// North  
				dir = NORTH;
				ay--;
			}
		} else {
			if (x + y > 0) {
				// South
				dir = SOUTH;
				ay++;
			} else {
				// West
				dir = WEST;
				ax--;
			}
		}
		if (this.isCellWithinBounds(ax, ay) && this.isCellTraversable(ax, ay)) {
			sendActionMove(dir);
		}
	}
	
	// Server action methods
	
	this.serverActionMove = function(id, dir) {
		console.log(this.avatars);
		var av = this.avatars[id];
		av.dir = dir;
		switch (dir) {
			case NORTH:
				av.y--;
				av.move();
				break;
			case SOUTH:
				av.y++;
				av.move();
				break;
			case EAST:
				av.x++;
				av.move();
				break;
			case WEST:
				av.x--;
				av.move();
				break;
		};
	};
	
	this.serverActionSay = function(id, s) {
		this.avatars[id].sayBubble(s);
	};
	
	
	this.serverActionSpawn = function(id, x, y) {
		if (id == userID) {
			// The spawn is about the player
			this.addPlayerAvatar(x, y, id, "afss.png");
			return;
		}
		this.addAvatar(x, y, id, "afss.png");
	};
	
	this.serverActionLeave = function(id) {
		this.avatars[id] = null;
	};
	
	
	
	this.deleteAvatar = function(id) {

	};
	
	this.init();
}

function CellObject() {

	this.init = function() {

		this.x = 0;
		this.y = 0;
		this.xdim = 1;
		this.ydim = 1;
		// height is used for the dom element
		this.heightmodifier = gridSize;
		this.image = null;



	};
	
	this.getCSS = function() {
		return $.extend({
			"width": this.xdim * gridSize,
			"height": this.ydim * gridSize + this.heightmodifier,
			"z-index": this.y+1,
			"background-image": "url(" + this.image + ")"
		}, this.getOffsets());
	};
	
	this.update = function() {

		if (!this.elem) {
			this.elem = $('<div class="floorobject">').appendTo(this.map.elem);
		}
		this.elem.css(this.getCSS());
	};
	
	this.getMiddle = function() {
		var offsets = this.getOffsets();
		return this.offsets().left + this.xdim * gridSize / 2;
	};
	
	this.getOffsets = function () {

		return {
			"bottom": gridSize * (this.map.ydim - this.y - this.ydim),
			"left": this.x * gridSize,
		};
	};
	
	this.init();
};

function Furniture(map) {

	this.init = function() {
		this.map = map;
		this.update();
	}
		
	this.init();
}
Furniture.prototype = new CellObject();


function Avatar(map) {
	

	
	this.init = function() {
		this.map = map;
		this.dir = "S";
		this.bubbleElem = null;
		this.bubbleTimer = null;
	
		this.inTransit = false;

	};
	
	this.updateImage = function() {
		console.log("setting image to ", this.image);
		this.elem.css("background-image", "url(" + this.image + ")");
	}
	
	this.move = function() {
		
		this.inTransit = true;
		this.image = this.getMovingImage();
		this.updateImage();
		this.elem.animate(this.getOffsets(), 600, 'linear', $.proxy(this, "moveComplete"));
	}
	
	this.moveComplete = function() {
		this.inTransit = false;
		this.image = this.getStandingImage();
		this.updateImage();
	}
	
	this.sayBubble = function(text) {
		if (this.bubbleElem) {
			clearTimeout(this.bubbleTimer);
		} else {

			this.bubbleElem = $('<div class="bubble">')
				.appendTo(this.map.elem)
				.css("display", "none")
				.fadeIn();
			
		}
		var avatarOffsets = this.getOffsets();
		this.bubbleElem.text(text);

		this.bubbleElem.css({
			"left": avatarOffsets.left + gridSize/2 - this.bubbleElem.outerWidth()/2,
			"bottom": avatarOffsets.bottom + gridSize * 1.5
		});

		this.bubbleTimer = setTimeout($.proxy(this, "onBubbleExpire"), 3000);
		
	};
	
	this.getStandingImage = function() {
		return 'afs' + this.dir.toLowerCase() + '.png';
	};
	
	this.getMovingImage = function() {
		return 'afm' + this.dir.toLowerCase() + '.png';
	};
	
	this.onBubbleExpire = function() {

		this.bubbleElem.fadeOut(function() {
			$(this).remove();
		});

		this.bubbleElem = null;
	};
	this.init();
}
Avatar.prototype = new CellObject();
