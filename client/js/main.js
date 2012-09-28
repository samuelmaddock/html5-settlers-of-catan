var CLIENT = true;
var SERVER = false;
//var IP = 'http://catan.nodester.com:80/';
var IP = 'http://127.0.0.1:80/';
var Namespace = 'lobby';

CATAN._init = function() {

	IP = "http://" + window.location.host + ":80/"

	// Connect to server
	this.socket = io.connect(IP+Namespace);
	this.socket.on( 'serverReady', function(data) {
		CATAN.connectToServer(data.id);
	});

	var hash = window.location.hash.toString().substr(1,5);
	if(hash !== "") {
		this.connectToServer(hash,false);
	} else {
		this.Lobby = this.GUI.create('Lobby');

		this.socket.on( 'loadServerList',	this.Lobby.loadServerList );
		this.socket.on( 'serverStatus',		this.Lobby.serverUpdate );
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

	socket.on('connectionStatus', function(data) {
		if(data.success == true) {
			console.log("Successfully connected to server");
			CATAN.setupGame();
		} else {
			console.log(data.message);
		};
	});

	socket.on('syncPlayer', function (data) {
		data.newply = false;
		CATAN.Players.connect(data);
	});

	socket.on('boardEntities', function (data) {
		for(var i in data.ents) {
			var ent = CATAN.ents.create(data.name);
			ent.setup(data.ents[i]);
		}
	});

	socket.on('setupBuild', function (data) {
		if(data.building == BUILDING_SETTLEMENT) {
			CATAN.Notify({subtitle:T('SelectSettlement')});
		} else {
			CATAN.Notify({subtitle:T('SelectRoad')})
		}

		CATAN.Game.collisionObjects.length = 0

		for(var i in data.available) {
			var ent = CATAN.ents.getById(data.available[i]);
			ent.show(0.33);
			CATAN.Game.collisionObjects.push( ent.getMesh() );
		}
	});

	socket.on('PlayerJoin', function (data) {
		data.newply = true;
		CATAN.Players.connect(data);
	});

	socket.on('PlayerLeave', function (data) {
		var ply = CATAN.Players.getById(data.id);
		self.chat.AddLine( T('PlayerDisconnect', ply.getName()) );
		CATAN.Players.disconnect(ply);
	});

	socket.on('PlayerChat', function (data) {
		data.ply = CATAN.Players.getById(data.id);
		self.chat.AddLine(data, "player");
	});

	socket.on('PlayerBuild', function (data) {
		var ply = CATAN.Players.getById(data.id),
			ent = CATAN.ents.getById(data.entid);

		ent.setOwner(ply);

		// End build
		if( ply == CATAN.LocalPlayer ) {
			CATAN.endBuildMode();
		}
	});

	socket.on('GameUpdate', function (data) {
		if(data.error) {
			// TODO: Display errors in modal
			self.chat.AddLine(data.message);
		} else {
			self.chat.AddLine(T(data.message));
		}
	});

	socket.on('RolledDice', function (data) {
		console.log("Rolled Dice");
		var text = "Rolled: " + data.d1 + " + " + data.d2 + " = " + (data.d1 + data.d2);

		CATAN.Notify({
			title: "Dice results",
			subtitle: text
		})
	});

	socket.on('GiveResources', function (data) {
		CATAN.Notify({
			subtitle: "Got resources!"
		});

		console.log(data);

		for(var i in data.resources) {
			var res = data.resources[i];
			CATAN.LocalPlayer.giveResource(res.r, res.n);
		}

		CATAN.debug.updateStats();
	});

	socket.on('PlayerStartBuild', function (data) {
		CATAN.Game.collisionObjects.length = 0

		for(var i in data.available) {
			var ent = CATAN.ents.getById(data.available[i]);
			ent.show(0.33);
			CATAN.Game.collisionObjects.push( ent.getMesh() );
		}
	});

	socket.on('PlayerTurn', function (data) {
		var ply = CATAN.Players.getById(data.id);
		if(ply == CATAN.LocalPlayer) {
			CATAN.Notify({
				subtitle:T('LocalPlayerTurn')
			});
		} else {
			CATAN.Notify({
				subtitle:T('PlayerTurn', ply.getName())
			});
			CATAN.endBuildMode();
		}
	});

	socket.on('Message', function (data) {
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