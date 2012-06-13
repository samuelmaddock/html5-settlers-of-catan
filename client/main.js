var CLIENT = true;
var SERVER = false;
//var IP = 'http://catan.nodester.com:80/';
var IP = 'http://127.0.0.1:80/';

CATAN._init = function() {

	this.Lobby = this.GUI.create('Lobby');

	// Connect to lobby
	this.socket = io.connect(IP);
	this.socket.on( 'loadServerList',	this.Lobby.loadServerList );
	this.socket.on( 'serverStatus',		this.Lobby.serverUpdate );
	this.socket.on( 'serverReady', function(data) {
		CATAN.connectToServer(data.id);
	});


	var hash = window.location.hash.toString().substr(1,5);
	if(hash !== "") {
		this.connectToServer(hash);
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

	this.Lobby.remove();

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
			CATAN.create(data.name, data.ents[i]);
		}

	});

	socket.on('setupBuild', function (data) {

		CATAN.Game.collisionObjects.length = 0

		for(var i in data.available) {
			var ent = CATAN.getEntById(data.available[i]);
			ent.show(0.33);
			CATAN.Game.collisionObjects.push( ent.Collision );
		}

	});

	socket.on('PlayerJoin', function (data) {
		CATAN.addPlayer(data,true)
	});

	socket.on('PlayerLeave', function (data) {
		var ply = self.getPlayerById(data.id);
		self.chat.AddLine(ply.getName() + " has disconnected");
		self.removePlayer(ply);
	});

	socket.on('PlayerChat', function (data) {
		data.ply = CATAN.getPlayerById(data.id);
		self.chat.AddLine(data, "player");
	});

	socket.on('PlayerBuild', function (data) {
		var ply = CATAN.getPlayerById(data.id),
			ent = CATAN.getEntById(data.entid);

		ent.setOwner(ply);

		// End build
		if( ply.getID() == CATAN.LocalPlayer.getID() ) {
			for(var i in CATAN.Entities) {
				var ent2 = CATAN.Entities[i];
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

	var resource = 0;
	function resourceFinished( geometry ) {
		CATAN.getSchema().Resources[resource].geometry = geometry;
		resource++;
		precacheFinished();
	}
	
	// Precache resources
	var loader = new THREE.JSONLoader( true );
	for ( var i = 0; i < NUM_RESOURCES; i++ ) {
		var res = CATAN.getSchema().Resources[i];
		loader.load( res.url, resourceFinished );
		totalPrecached++;
	}
	
	// Precache robber
	loader.load( CATAN.getSchema().Robber.url, function(geometry) {
		CATAN.getSchema().Robber.geometry = geometry;
		precacheFinished();
	});
	totalPrecached++;
	
}

CATAN.Fullscreen = function() {
	$('#game').webkitRequestFullScreen();
}