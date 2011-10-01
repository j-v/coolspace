function sendActionMove(dir) {
	console.log(dir);
	//floor.serverActionMove(userID, dir);
	now.sendUserAction({
		"userID": userID,
		"action": "move",
		"params": {"dir": dir}
	});
}

function sendActionSay(s) {
	console.log("message", s);
		now.sendUserAction({
			"userID": userID,
			"action": "say",
			"params": {"message": s}
		});
}

now.receiveUserAction = function(data, err) {
	if (err) {
		console.log("Error received by now.receiveUserAction", err);
		return;
	}
	switch (data.action) {
		case "move":
			floor.serverActionMove(data.userID, data.params.dir);
			break;
		case "spawn":
			floor.serverActionSpawn(data.userID, data.params.x, data.params.y);
			break;
		case "say":
			floor.serverActionSay(data.userID, data.params.message);
			break;
		case "leave":
			floor.serverActionLeave();
			break;
		default:
			console.log("Unrecognized server message in now.receiveUserAction", data.action);
	
	}
}


$(init);

var gridSize = 40;
var wall;
var floor;
var userID = "user1";
function init() {

	wall = new WallMap('#map-container');
	floor = new FloorMap('#map-container');
	floor.addFurniture(1, 1, 3, 1, "table.png");
	floor.addPlayerAvatar(4,1, "user1", "avatar.png");

}

function WallMap (container) {
	this.init = function() {
		this.container = container;
		this.xdim = 10;
		this.ydim = 6;

		
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
		return cells;
	
	};
	this.addPlayerAvatar = function(x, y, id, image) {
		if (this.playerAvatar) throw "Player avatar already exists";
		this.playerAvatar = this.addAvatar(x, y, id, image);
	};
	
	this.addAvatar = function(x, y, id, image) {
		var av = new Avatar(this);
		av.x = x;
		av.y = y;
		av.id = id;
		av.xdim = 1;
		av.ydim = 1;
		av.heightmodifier = gridSize/2;
		av.image = image;

		this.objects.push(av);
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
				dir = "E";
				ax++;
			} else {
				// North  
				dir = "N";
				ay--;
			}
		} else {
			if (x + y > 0) {
				// South
				dir = "S";
				ay++;
			} else {
				// West
				dir = "W";
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
		switch (dir) {
			case "N":
				av.y--;
				av.move();
				break;
			case "S":
				av.y++;
				av.move();
				break;
			case "E":
				av.x++;
				av.move();
				break;
			case "W":
				av.x--;
				av.move();
				break;
		};
	};
	
	this.serverActionSay = function(id, s) {
		
	};
	
	this.serverActionSpawn = function(id, x, y) {
	
	};
	
	this.serverActionLeave = function(id) {
		
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



		this.bubbleElem = null;
		this.bubbleTimer = null;
	
		this.inTransit = false;

	};
	
	this.move = function() {
		
		this.inTransit = true;
		this.elem.animate(this.getOffsets(), 1000, 'linear', $.proxy(this, "moveComplete"));
	}
	
	this.moveComplete = function() {
		this.inTransit = false;
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
			"left": avatarOffsets.left + gridSize/2 - this.bubbleElem.width()/2,
			"bottom": avatarOffsets.bottom + gridSize * 2.5
		});

		this.bubbleTimer = setTimeout($.proxy(this, "onBubbleExpire"), 5000);
		
	}
	
	this.onBubbleExpire = function() {

		this.bubbleElem.fadeOut(function() {
			$(this).remove();
		});

		this.bubbleElem = null;
	}
	this.init();
}
Avatar.prototype = new CellObject();
