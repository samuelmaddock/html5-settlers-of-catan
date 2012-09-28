var L = {};

// Common
L["Title"] = "Settlers of Catan";		// Game Title
L["DefaultName"] = "Settler";			// Default player name

// Lobby
L["ServerList"] = "Server List";		// Server list header
L["ServerListName"] = "Name";			// Server list name column
L["ServerListSchema"] = "Schema";		// Server list schema column
L["ServerListPlayers"] = "Players";		// Server list player column

L["PlayerNamePlaceholder"] = "Your name";	// Player name placeholder

L["ServerCreate"] = "Create Server";	// Server setup header
L["ServerNamePlaceholder"] = "Server Name";	// Server name placeholder
L["ServerConfig"] = "Configuration";	// Server configuration subtitle
L["ServerPublic"] = "Public";			// Public server
L["ServerConnect"] = "Connect";			// Connect button

// Schema Names
L["SchemaClassic"] = "Classic";			// Classic schema name

// In-Game
L["PlayerConnect"] = "{0} has joined the game ({1}:{2}).";	// Player joined
L["PlayerDisconnect"] = "{0} has disconnected.";			// Player disconnected
L["PlayerTurn"] = "It is now {0}'s turn.";		// Other player's turn
L["LocalPlayerTurn"] = "It is now your turn.";	// Local Player's turn

// Game notifications
L["SelectSettlement"] = "Select a settlement.";		// Setup state, select settlement
L["SelectRoad"] = "Select a road.";					// Setup state, select road

// Game Updates
L["StateSetup"] = "Setup mode has now begun.";		// Setup state message
L["StatePlaying"] = "Game is now in-progress.";		// Playing state message
L["StateEnd"] = "Game has ended.";					// End state message

CATAN.Localization.register("english", L);