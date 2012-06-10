CATAN.TurnManager = function(game) {

	this.game = game;
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
			{ Resource: BUILDING_SETTLEMENT, Num: 1 },
			{ Resource: BUILDING_ROAD, Num: 1 },
			{ Resource: BUILDING_SETTLEMENT, Num: 2 },
			{ Resource: BUILDING_ROAD, Num: 2 }
		];

		this.setupNextPlayer(ply);

	},

	handleSetupRequest: function(ply, ent) {

		var settlements = ply.getBuildingsByType(BUILDING_SETTLEMENT).length,
			roads = ply.getBuildingsByType(BUILDING_ROAD).length;

		// Build order check
		while(true) {
			// 1 settlement
			if(settlements < 1) {
				if(ent.Building != BUILDING_SETTLEMENT) return;
				break;
			}

			// 1 settlement, 1 road
			if(roads < 1) {
				if(ent.Building != BUILDING_ROAD) return;
				break;
			}

			// 2 settlements, 1 road
			if(settlements < 2) {
				if(ent.Building != BUILDING_SETTLEMENT) return;
				break;
			}

			// 2 settlements, 2 roads
			if(roads < 2) {
				if(ent.Building != BUILDING_ROAD) return;
				break;
			}
		}

		ent.build(ply);

		this.game.emit('PlayerBuild', {
			id: ply.getID(),
			entid: ent.getEntId()
		});

		// Update count
		settlements = ply.getBuildingsByType(BUILDING_SETTLEMENT).length,
			roads = ply.getBuildingsByType(BUILDING_ROAD).length;

		// Continue player turn
		if((settlements == 1 && roads < 1) || (settlements == 2 && roads < 2)) {
			this.setupNextPlayer(ply);
			return;
		}

		var bDone = true,
			players = this.game.getPlayers();

		for(var i in players) {
			if((typeof players[i].SetupStep == 'undefined') || (players[i].SetupStep < 3)) {
				bDone = false;
			}
		}

		if(bDone) {

			// distribute resources
			
			
			this.game.setState(STATE_PLAYING);
			
		} else {
			this.nextTurn();
			this.setupNextPlayer(this.getCurrentPlayer());
		}

	},

	setupNextPlayer: function(ply) {

		ply.SetupStep = (typeof ply.SetupStep == 'undefined') ? 0 : ++ply.SetupStep;

		this.game.emit('PlayerTurn', {
			id: ply.getID()
		})

		var entities;
		if(ply.SetupStep == 0 || ply.SetupStep == 2) {
			entities = this.game.board.hexCorners;
		} else if(ply.SetupStep == 1 || ply.SetupStep == 3) {
			entities = this.game.board.hexEdges;
		}

		var buildable = [];
		for(var i in entities) {
			if(entities[i].canBuild(ply)) {
				buildable.push(entities[i].getEntId());
			}
		}

		ply.emit('setupBuild', {
			building: this.setupBuildOrder[ply.SetupStep].Resource,
			available: buildable
		})

	}

	/*---------------------------------------
		Playing
	---------------------------------------*/


	/*---------------------------------------
		End
	---------------------------------------*/


}