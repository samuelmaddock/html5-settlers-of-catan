// Include dependencies
require('./enums.js'); // can't use shared/enums.js since they don't use global
require('../shared/catan.js');

// Shared modules
require("fs").readdirSync("./html5-settlers-of-catan/shared/modules").forEach(function(file) {
	require("../shared/modules/" + file);
});

// Server modules
require("fs").readdirSync("./html5-settlers-of-catan/server/modules").forEach(function(file) {
	require("../server/modules/" + file);
});

CATAN.setupSockets = function(io) {
	this.Server = io;
	this.Lobby = io.of('/lobby');

	// Socket hooks
	io.sockets.on('connection', function(socket) {
		console.log("[MAIN] Client connected");
		CATAN.Players.connect(socket);
		socket.emit('loadServerList', { Servers: CATAN.Games.getVisible() });
	});

	this.Lobby.on('connection', function(socket) {
		console.log("[LOBBY] Client connected");

		var ply = CATAN.Players.getBySocket(socket);

		socket.on('createServer', function(data) {
			CATAN.Games.setup(ply, data);
		});

		socket.on('changeName', function(data) {
			ply.setName(data.name);
		});
	});
};