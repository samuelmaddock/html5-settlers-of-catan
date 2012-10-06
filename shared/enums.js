(function() {

	// Global variable
	var g = SERVER ? GLOBAL : window;

	// Grid tiles
	g.TILE_INVALID	= 0;
	g.TILE_LAND		= 1;
	g.TILE_SEA		= 2;

	// Resource types
	g.RESOURCE_DESERT	= 0;
	g.RESOURCE_LUMBER 	= 1;
	g.RESOURCE_BRICK 	= 2;
	g.RESOURCE_SHEEP	= 3;
	g.RESOURCE_GRAIN	= 4;
	g.RESOURCE_ORE		= 5;

	// Building types
	g.BUILDING_ROAD 		= 0;
	g.BUILDING_SETTLEMENT 	= 1;
	g.BUILDING_CITY 		= 2;

	// Corner locations
	g.CORNER_TL	= 0;
	g.CORNER_TR = 1;
	g.CORNER_R 	= 2;
	g.CORNER_BR	= 3;
	g.CORNER_BL	= 4;
	g.CORNER_L	= 5;

	// Edge locations
	g.EDGE_T 	= 0;
	g.EDGE_TR	= 1;
	g.EDGE_BR	= 2;
	g.EDGE_B	= 3;
	g.EDGE_BL	= 4;
	g.EDGE_TL	= 5;

	// Message Types
	g.MSG_DEFAULT	= 0;
	g.MSG_ERROR		= 1;

	// Server-side globals
	if(SERVER) {

		// Game state
		g.STATE_NONE	= 0;
		g.STATE_WAITING	= 1;
		g.STATE_SETUP	= 2;
		g.STATE_PLAYING	= 3;
		g.STATE_END		= 4;

		// Player Status
		g.PLAYER_LOBBY		= 0;
		g.PLAYER_JOINING	= 1;
		g.PLAYER_CONNECTED	= 2;

	}

})();