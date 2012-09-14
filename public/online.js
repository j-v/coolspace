
function joinRoomRequest() {
	now.requestRoomData(function (obj) {
		for (var i=0; i < obj.users.length; i++) {
			var u = obj.users[i];
			var image = 'afss.png';
			switch (u.dir) {
				case NORTH: image = 'afsn.png'; break;
				case SOUTH: image = 'afss.png'; break;
				case WEST: image = 'afsw.png'; break;
				case EAST: image = 'afse.png'; break;
			}
			floor.addAvatar(u.x, u.y, u.username, image);
		}
		console.log("Joined room:", obj);
		now.sendUserAction({
			userID: userID,
			action: 'spawn',
			params: {}
		});
	});

}



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


now.receiveRoomData = function(data,err) {
	isRoomDataReceived = true;
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
