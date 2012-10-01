CATAN.TurnManager = function(game) {

	this.game = game;
	this.board = game.board;
	this.turn = 0;
	this.currentPlayer;

}

CATAN.TurnManager.prototype = {

	roll: function() {
		return [ Math.random()*6, Math.random()*6 ];
	},

	start: function() {

		var state = this.game.getState();
		if(state != STATE_WAITING) return;

		// Begin setup mode
		this.game.setState(STATE_SETUP);

		this.getCurrentPlayer().setTurn(true);
		this.initSetup(this.getCurrentPlayer());

	},

	end: function() {

		this.game.setState(STATE_END);

	},

	setCurrentPlayer: function(ply) {
		this.currentPlayer = ply;
		this.currentPlayer.setTurn(true);
	},

	getCurrentPlayer: function() {

		// Make sure the current player is valid
		if(!this.game.isValidPlayer(this.currentPlayer)) {
			this.currentPlayer = this.game.getPlayers()[0];
		}

		return this.currentPlayer;

	},

	nextTurn: function() {

		var players = this.game.getPlayers();

		this.getCurrentPlayer().setTurn(false);

		// Move current player to last array index
		players.splice(players.length, 0, players.splice(0, 1)[0]);

		// Current player is based on the first index of
		// the game players array
		this.setCurrentPlayer(players[0]);

		this.game.emit('PlayerTurn', {
			id: this.getCurrentPlayer().getID()
		})

		this.turn++;

	},

	/*---------------------------------------
		Setup
	---------------------------------------*/

	initSetup: function(ply) {

		this.setupBuildOrder = [
			{ Type: BUILDING_SETTLEMENT, Num: 1 },
			{ Type: BUILDING_ROAD, Num: 1 },
			{ Type: BUILDING_SETTLEMENT, Num: 2 },
			{ Type: BUILDING_ROAD, Num: 2 }
		];

		this.setCurrentPlayer(ply);

		this.game.emit('PlayerTurn', {
			id: this.getCurrentPlayer().getID()
		});
		
		this.setupNextPlayer(ply);

	},

	handleSetupRequest: function(ply, ent) {

		// Build order check
		var stage = this.setupBuildOrder[ply.SetupStep];
		if(ent.Building != stage.Type || ply.getBuildingsByType(stage.Type).length != stage.Num-1) {
			return;
		}

		ent.build(ply);

		this.game.emit('PlayerBuild', {
			id: ply.getID(),
			entid: ent.getEntId()
		});

		// Update count
		var settlements = ply.getBuildingsByType(BUILDING_SETTLEMENT).length,
			roads = ply.getBuildingsByType(BUILDING_ROAD).length;

		// Continue player turn
		if((settlements == 1 && roads < 1) || (settlements == 2 && roads < 2)) {
			this.setupNextPlayer(ply);
			return;
		}

		// distribute resources
		if(settlements == 2 && roads == 2) {
			var tiles = ply.getBuildingsByType(BUILDING_SETTLEMENT)[1].AdjacentTiles;
			for(var i in tiles) {
				ply.giveResource(tiles[i].getResource());
			}
		}

		var bDone = true,
			players = this.game.getPlayers();

		for(var i in players) {
			if((typeof players[i].SetupStep == 'undefined') || (players[i].SetupStep < 3)) {
				bDone = false;
			}
		}

		if(bDone) {
			this.game.setState(STATE_PLAYING);
			this.nextTurn();
		} else {
			this.nextTurn();
			this.setupNextPlayer(this.getCurrentPlayer());
		}

	},

	setupNextPlayer: function(ply) {

		ply.SetupStep = (typeof ply.SetupStep == 'undefined') ? 0 : ++ply.SetupStep;

		var entities;
		if(ply.SetupStep == 0 || ply.SetupStep == 2) {
			entities = this.board.getCorners();
		} else if(ply.SetupStep == 1) {
			entities = ply.getBuildingsByType(BUILDING_SETTLEMENT)[0].getAdjacentEdges();
		} else if(ply.SetupStep == 3) {
			entities = ply.getBuildingsByType(BUILDING_SETTLEMENT)[1].getAdjacentEdges();
		}

		var buildable = [];
		for(var i in entities) {
			if(entities[i].canBuild(ply)) {
				buildable.push(entities[i].getEntId());
			}
		}

		ply.emit('setupBuild', {
			building: this.setupBuildOrder[ply.SetupStep].Type,
			available: buildable
		});

	},

	/*---------------------------------------
		Playing
	---------------------------------------*/

	playingAdvanceTurn: function() {
		this.nextTurn();
	}


	/*---------------------------------------
		End
	---------------------------------------*/


}