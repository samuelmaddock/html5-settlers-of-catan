//var IP = 'http://catan.nodester.com:80/';
var IP = 'http://127.0.0.1:80/';
var Namespace = 'lobby';

CATAN._init = function() {

	IP = "http://" + window.location.host + ":80/"

	// Connect to server
	this.socket = io.connect(IP+Namespace);
	this.socket.on( 'CServerReady', function(data) {
		CATAN.connectToServer(data.id);
	});

	var hash = window.location.hash.toString().substr(1,5);
	if(hash !== "") {
		this.connectToServer(hash,false);
	} else {
		this.Lobby = this.GUI.create('Lobby');

		this.socket.on( 'CLoadServerList',	this.Lobby.loadServerList );
		this.socket.on( 'CServerStatus',	this.Lobby.serverUpdate );
	}

};

CATAN.createServer = function() {

	// Create server list html
	this.socket.emit('createServer', {
		name: $("#servername").attr('value'),
		schema: $("#schema").attr('value'),
		public: ($("#public").attr('checked') == 'checked')
	});

};

CATAN.connectToServer = function(id, isEvent) {

	// Called from clicking on serverlist
	if(isEvent) {
		id = id.target.hash.substr(1,5);
	}

	if(typeof id !== 'string') {
		var event = id || window.event;
		var target = event.target || event.srcElement;
		id = target.id;
	}

	console.log("Connecting to #" + id);

	// Update name
	this.socket.emit('changeName', { name: CATAN.getName() } );

	this.server = io.connect(IP + id);
	this.setupSocket(this.server);

	window.location.hash = id;

	// TODO: Fix bug causing multiple iterations of game board to load
	// Make sure the game actually existed
	var self = this;
	setTimeout(function() {
		// Game didn't exist
		if($('#game').length == 0) {
			// TODO: Display error in modal
			console.log("Server didn't exist!");
			window.location.hash = "";
			self._init();
		} else {
			// Disconnect from lobby
			self.socket.disconnect();
		}
	}, 1000 * 3);

};

CATAN.onConnection = function() {
	this.board = new CATAN.Board();

	this.server.emit( 'playerReady', { name: CATAN.getName() } );

	this.chat = this.GUI.create("Chatbox");
	this.debug = this.GUI.create("Debug");
};

CATAN.setupGame = function() {

	if(this.Lobby !== undefined) {
		this.Lobby.remove();
	}

	$('body').append($('<div>').attr('id', 'game'));

	this.precacheModels();

};

CATAN.setupSocket = function(socket) {

	var self = this;

	socket.on('CConnectionStatus', function(data) {
		if(data.success == true) {
			console.log("Successfully connected to server");
			CATAN.setupGame();
		} else {
			console.log(data.message);
		};
	});

	socket.on('CSyncPlayer', function (data) {
		data.newply = false;
		CATAN.Players.connect(data);
	});

	socket.on('CBoardEntities', function (data) {
		for(var i in data.ents) {
			var ent = CATAN.ents.getById(data.ents[i].id);
			ent.setup(data.ents[i]);
		}
	});

	socket.on('CSetupBuild', function (data) {
		if(data.building == BUILDING_SETTLEMENT) {
			CATAN.Notify({subtitle:T('SelectSettlement')});
		} else {
			CATAN.Notify({subtitle:T('SelectRoad')})
		}

		var ply = CATAN.LocalPlayer;
		var entities;
		if(data.step == 0 || data.step == 2) {
			entities = CATAN.board.getCorners();
		} else if(data.step == 1) {
			entities = ply.getBuildingsByType(BUILDING_SETTLEMENT)[0].getAdjacentEdges();
		} else if(data.step == 3) {
			entities = ply.getBuildingsByType(BUILDING_SETTLEMENT)[1].getAdjacentEdges();
		}

		CATAN.Game.collisionObjects.length = 0

		for(var i in entities) {
			if(entities[i].canBuild(ply)) {
				var ent = entities[i];
				ent.show(0.33);
				CATAN.Game.collisionObjects.push( ent.getMesh() );
			}
		}
	});

	socket.on('CPlayerJoin', function (data) {
		data.newply = true;
		CATAN.Players.connect(data);
	});

	socket.on('CPlayerLeave', function (data) {
		var ply = CATAN.Players.getById(data.id);
		self.chat.AddLine( T('PlayerDisconnect', ply.getName()) );
		CATAN.Players.disconnect(ply);
	});

	socket.on('CPlayerChat', function (data) {
		data.ply = CATAN.Players.getById(data.id);
		self.chat.AddLine(data, "player");
	});

	socket.on('CPlayerBuild', function (data) {
		var ply = CATAN.Players.getById(data.id),
			ent = CATAN.ents.getById(data.entid);

		ent.build(ply);

		// End build
		if( ply == CATAN.LocalPlayer ) {
			CATAN.endBuildMode();
		}
	});

	socket.on('CGameUpdate', function (data) {
		CATAN.state = data.state;

		var msg = "State" + data.state;
		if(data.error) {
			// TODO: Display errors in modal
			self.chat.AddLine(msg);
		} else {
			self.chat.AddLine(T(msg));
		}
	});

	socket.on('CRolledDice', function (data) {
		var token = data.d1 + data.d2;

		CATAN.Notify({
			title: "Dice results",
			subtitle: T('RolledDice', data.d1, data.d2, token)
		});

		if(token == 7 && CATAN.LocalPlayer.isTurn()) {
			CATAN.Notify({
				title: "Dice results",
				subtitle: T('MoveRobber')
			});
			var tiles = CATAN.ents.getByName('HexTile');
			for(var i in tiles) {
				var tile = tiles[i];
				if(!tile.hasRobber()) {
					CATAN.Game.collisionObjects.push( tile.getMesh() );
				}
			}
		}
	});

	socket.on('CRobberMoved', function (data) {
		if(CATAN.LocalPlayer.isTurn()) {
			CATAN.Game.collisionObjects.length = 0;
		}

		var tile = CATAN.ents.getById(data.id);
		CATAN.board.getRobber().setTile(tile);
	});

	socket.on('CGiveResources', function (data) {
		CATAN.Notify({
			subtitle: "Got resources!"
		});

		for(var i in data.resources) {
			var res = data.resources[i];
			CATAN.LocalPlayer.giveResource(res.r, res.n);
		}

		CATAN.debug.updateStats();
	});

	socket.on('CPlayerStartBuild', function (data) {
		CATAN.Game.collisionObjects.length = 0

		var available = CATAN.getAvailableBuildings();
		for(var i in available) {
			var ent = available[i];
			if(!ent.hasOwner()) {
				ent.show(0.44);
			}
			CATAN.Game.collisionObjects.push( ent.getMesh() );
		}
	});

	socket.on('CPlayerTurn', function (data) {
		CATAN.ClearNotifications();
		var ply = CATAN.Players.getById(data.id);
		if(ply == CATAN.LocalPlayer) {
			CATAN.LocalPlayer.setTurn(true);
			CATAN.Notify({
				subtitle:T('LocalPlayerTurn')
			});
		} else {
			CATAN.LocalPlayer.setTurn(false);
			CATAN.Notify({
				subtitle:T('PlayerTurn', ply.getName())
			});
			CATAN.endBuildMode();
		}
	});

	socket.on('CMessage', function (data) {
		CATAN.Notify({
			subtitle:T(data.subtitle)
		});
	});

}

CATAN.precacheModels = function() {

	$('#game').html("<center><font size=72>PRECACHING...</font></center>");

	console.log("PRECACHING MODELS...");

	CATAN.AssetManager.loadAll(function() {
		document.getElementById("game").innerHTML = null;
		
		CATAN.Game = CATAN.GUI.create('Game');
		CATAN.Game.animate();

		CATAN.onConnection();
	})
	
}

String.prototype.format = function() {
	var formatted = this;
	for(arg in arguments[0]) {
		formatted = formatted.replace("{" + arg + "}", arguments[0][arg]);
	}
	return formatted;
};