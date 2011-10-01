var now = {};

function joinRoomRequest(userID) {
	floor.serverActionSpawn(userID, 0, 0);
}

function sendActionMove(dir) {
	console.log(dir);
	floor.serverActionMove(userID, dir);

}

function sendActionSay(s) {
	floor.serverActionSay(userID, s);
}

