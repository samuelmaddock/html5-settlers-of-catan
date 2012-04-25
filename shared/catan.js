var CATAN = CATAN || { VERSION: '1.00' };

CATAN.Schemas = [];
CATAN.Games = [];

CATAN.setupGame = function(namespace,schema) {
	var game = new this.Game(namespace,schema);
    this.Games.push(game);
};

CATAN.getGameByURI = function(uri) {
	for(var i in this.Games) {
		var game = this.Games[i];
		if(game.namespace === uri) {
			return game;
		}
	}
}

if(typeof exports !== 'undefined') {

	global.CATAN = CATAN;

	// Load schemas
	require("fs").readdirSync("./shared/schemas").forEach(function(file) {
		require("./schemas/" + file);
	});

};