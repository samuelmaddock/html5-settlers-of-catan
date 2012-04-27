CATAN.Schemas = [];
CATAN.Games = [];

CATAN.Names = []; // Store client names by IP

CATAN.ClientCount = 0;

CATAN.setupGame = function(socket,name,schema,public) {
	var game = new this.Game(socket,name,schema,public);
    this.Games.push(game);
};

CATAN.getGameByNamespace = function(uri) {
	for(var i in this.Games) {
		var game = this.Games[i];
		if(game.namespace === uri) {
			return game;
		}
	}
};

CATAN.getGameById = function(id) {
	for(var i in this.Games) {
		var game = this.Games[i];
		if(game.id === id) {
			return game;
		}
	}
};

CATAN.getTotalPlayers = function() {
	var numply = 0;
	for(var i in this.Games) {
		numply += this.Games[i].getPlayers().length;
	}
};

if(typeof exports !== 'undefined') {

	global.CATAN = CATAN;

	// Load schemas
	require("fs").readdirSync("./server/schemas").forEach(function(file) {
		require("./schemas/" + file);
	});

};