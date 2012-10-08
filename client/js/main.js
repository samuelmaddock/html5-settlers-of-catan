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
		this.socket.on( 'CServerList',	this.Lobby.loadServerList );
	}

	// Request desktop notification permissions
	document.addEventListener("mousedown", function(event) {
		if(!window.webkitNotifications) return;
		if(webkitNotifications.checkPermission() > 0) {
			webkitNotifications.requestPermission();
		}
	}, false);

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
			self.setupGame();
		} else {
			console.log(data.message);
		};
	});

	socket.on('CSyncPlayer', function (data) {
		data.newply = false;
		self.Players.connect(data);
	});

	socket.on('CBoardEntities', function (data) {
		for(var i in data.ents) {
			var ent = self.ents.getById(data.ents[i].id);
			ent.setup(data.ents[i]);
		}
	});

	socket.on('CSetupBuild', function (data) {
		if(data.building == BUILDING_SETTLEMENT) {
			self.Notify({subtitle:T('SelectSettlement')});
		} else {
			self.Notify({subtitle:T('SelectRoad')})
		}

		var ply = self.LocalPlayer;
		var entities;
		if(data.step == 0 || data.step == 2) {
			entities = self.board.getCorners();
		} else if(data.step == 1) {
			entities = ply.getBuildingsByType(BUILDING_SETTLEMENT)[0].getAdjacentEdges();
		} else if(data.step == 3) {
			entities = ply.getBuildingsByType(BUILDING_SETTLEMENT)[1].getAdjacentEdges();
		}

		for(var i in entities) {
			if(entities[i].canBuild(ply)) {
				var ent = entities[i];
				ent.show(0.33);
				self.Game.collisionObjects.push( ent.getMesh() );
			}
		}
	});

	socket.on('CPlayerJoin', function (data) {
		data.newply = true;		
		var ply = self.Players.connect(data);

		if(self.LocalPlayer && (ply == self.LocalPlayer)) {
			self.onConnected();
		}
	});

	socket.on('CPlayerLeave', function (data) {
		var ply = self.Players.getById(data.id);
		self.chat.AddLine( T('PlayerDisconnect', ply.getName()) );
		self.Players.disconnect(ply);
	});

	socket.on('CPlayerChat', function (data) {
		data.ply = self.Players.getById(data.id);
		self.chat.AddLine(data, "player");
	});

	socket.on('CPlayerBuild', function (data) {
		var ply = self.Players.getById(data.id),
			ent = self.ents.getById(data.entid);

		ent.build(ply);

		// End build
		if( ply == self.LocalPlayer ) {
			self.endBuildMode();
		}
	});

	socket.on('CGameUpdate', function (data) {
		self.state = data.state;

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

		self.Notify({
			title: "Dice results",
			subtitle: T('RolledDice', data.d1, data.d2, token)
		});

		if(token == 7 && self.LocalPlayer.isTurn()) {
			self.Notify({
				title: "Dice results",
				subtitle: T('MoveRobber')
			});

			console.log("SELECT TILE");

			var tiles = self.ents.getByName('HexTile');
			for(var i in tiles) {
				var tile = tiles[i];
				if(!tile.hasRobber() && tile.isLand()) {
					self.Game.collisionObjects.push( tile.getMesh() );
				}
			}
		}
	});

	socket.on('CRobberMoved', function (data) {
		if(self.LocalPlayer.isTurn()) {
			self.endBuildMode();
		}

		var tile = self.ents.getById(data.id);
		self.getBoard().getRobber().setTile(tile);
	});

	socket.on('CGiveResources', function (data) {
		self.Notify({
			subtitle: "Got resources!"
		});

		for(var i in data.resources) {
			var res = data.resources[i];
			self.LocalPlayer.giveResource(res.r, res.n);
		}

		self.debug.updateStats();
	});

	socket.on('CPlayerStartBuild', function (data) {
		var available = self.getAvailableBuildings();
		for(var i in available) {
			var ent = available[i];
			if(!ent.hasOwner()) {
				ent.show(0.44);
			}
			self.Game.collisionObjects.push( ent.getMesh() );
		}
	});

	socket.on('CPlayerTurn', function (data) {
		self.ClearNotifications();
		var ply = self.Players.getById(data.id);
		if(ply == self.LocalPlayer) {
			self.LocalPlayer.setTurn(true);
			self.Notify({
				subtitle:T('LocalPlayerTurn')
			});
		} else {
			self.LocalPlayer.setTurn(false);
			self.Notify({
				subtitle:T('PlayerTurn', ply.getName())
			});
			self.endBuildMode();
		}
	});

	socket.on('CMessage', function (data) {
		self.Notify({
			subtitle:T(data.subtitle)
		});
	});

	socket.on('CDevCard', function (data) {
		var action = data.action;
		if(action == 'add') {
			self.LocalPlayer.addDevCard(data.type);
		}
	});

}

CATAN.precacheModels = function() {
	$('#game').html("<center><font size=72>PRECACHING...</font></center>");

	console.log("PRECACHING MODELS...");

	var self = this;
	this.AssetManager.loadAll(function() {
		document.getElementById("game").innerHTML = null;
		
		self.Game = self.GUI.create('Game');
		self.Game.animate();

		self.chat = self.GUI.create("Chatbox");
		self.debug = self.GUI.create("Debug");

		self.board = new self.Board();

		// Let the server know we've finished loading
		self.server.emit( 'playerReady', { name: self.getName() } );
	})
}