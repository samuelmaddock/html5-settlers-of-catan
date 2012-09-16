var CLIENT = true;
var SERVER = false;
//var IP = 'http://catan.nodester.com:80/';
var IP = 'http://127.0.0.1:80/';
var Namespace = 'lobby';

CATAN._init = function() {

	// Connect to lobby
	this.socket = io.connect(IP+Namespace);
	this.socket.on( 'serverReady', function(data) {
		CATAN.connectToServer(data.id);
	});


	var hash = window.location.hash.toString().substr(1,5);
	if(hash !== "") {
		this.connectToServer(hash);
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

CATAN.connectToServer = function(id) {

	console.log("Connecting to #" + id);

	if(typeof id !== 'string') {
		var event = id || window.event;
		var target = event.target || event.srcElement;
		id = target.id;
	}

	this.server = io.connect(IP + id);
	this.setupSocket(this.server);

	window.location.hash = id;

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
		CATAN.addPlayer(data,false)
	});

	socket.on('boardEntities', function (data) {

		for(var i in data.ents) {
			var ent = CATAN.ents.create(data.name);
			ent.setup(data.ents[i]);
		}

	});

	socket.on('setupBuild', function (data) {

		if(data.building == BUILDING_SETTLEMENT) {
			CATAN.Notify({subtitle:"Select a settlement."});
		} else {
			CATAN.Notify({subtitle:"Select a road."})
		}

		CATAN.Game.collisionObjects.length = 0

		for(var i in data.available) {
			var ent = CATAN.ents.getById(data.available[i]);
			ent.show(0.33);
			CATAN.Game.collisionObjects.push( ent.getMesh() );
		}

	});

	socket.on('PlayerJoin', function (data) {
		CATAN.addPlayer(data,true)
	});

	socket.on('PlayerLeave', function (data) {
		var ply = self.getPlayerById(data.id);
		self.chat.AddLine( T('PlayerDisconnect', ply.getName()) );
		self.removePlayer(ply);
	});

	socket.on('PlayerChat', function (data) {
		data.ply = CATAN.getPlayerById(data.id);
		self.chat.AddLine(data, "player");
	});

	socket.on('PlayerBuild', function (data) {
		var ply = CATAN.getPlayerById(data.id),
			ent = CATAN.ents.getById(data.entid);

		ent.setOwner(ply);

		// End build
		if( ply.getID() == CATAN.LocalPlayer.getID() ) {
			var entities = CATAN.ents.getByName(["HexCorner","HexEdge"]);
			for(var i in entities) {
				var ent2 = entities[i];
				if(!ent2.hasOwner()) {
					ent2.hide();
				}
			}
		}
	});

	socket.on('GameUpdate', function (data) {
		if(data.error) {
			self.chat.AddLine(data.message);
		} else {
			self.chat.AddLine(data.message);
		}
	});

}

// TODO: make an asset manager
var precached = 0,
totalPrecached = 0;

CATAN.precacheModels = function() {

	$('#game').html("<center><font size=72>PRECACHING...</font></center>");

	console.log("PRECACHING MODELS...");

	function precacheFinished() {
		precached++;
		if (precached == totalPrecached) {		
			console.log("DONE!");
			document.getElementById("game").innerHTML = null;
			
			CATAN.Game = CATAN.GUI.create('Game');
			CATAN.Game.animate();

			CATAN.onConnection();
		}
	}
	
	var buildings = 0,
	resources = 0;

	// Precache resources
	var loader = new THREE.JSONLoader( true );
	for ( var i = 0; i < RESOURCE_ORE+1; i++ ) {
		var res = CATAN.getSchema().Resources[i];
		loader.load( res.url, function(geometry) {
			CATAN.getSchema().Resources[resources].geometry = geometry;
			precacheFinished();
			resources++;
		});
		totalPrecached++;
	}

	// Precache buildings
	for ( var j = 0; j < BUILDING_CITY+1; j++ ) {
		var res = CATAN.getSchema().Buildings[j];
		loader.load( res.url, function(geometry) {
			CATAN.getSchema().Buildings[buildings].geometry = geometry;
			precacheFinished();
			buildings++;
		});
		totalPrecached++;
	}
	
	// Precache robber
	loader.load( CATAN.getSchema().Robber.url, function(geometry) {
		CATAN.getSchema().Robber.geometry = geometry;
		precacheFinished();
	});
	totalPrecached++;
	
}

String.prototype.format = function() {
	var formatted = this;
	for(arg in arguments[0]) {
		formatted = formatted.replace("{" + arg + "}", arguments[0][arg]);
	}
	return formatted;
};