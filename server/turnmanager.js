TurnManager = function() {
	this.State = STATE_SETUP
	this.Player = null
	this.Players = []
}

express.Start(players) {
	var manager = new TurnManager()
	manager.Players = players

	return manager
}

express.Roll() {
	return [ Math.random()*6, Math.random()*6 ]
}