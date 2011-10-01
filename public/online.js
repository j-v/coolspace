
function joinRoomRequest() {
	now.requestRoomData(function (obj) {
		for (var i=0; i < obj.user.length; i++) {
			var u = obj.user[i];
			floor.addPlayer(u.x, u.y, u.username);
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
