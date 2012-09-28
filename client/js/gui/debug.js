var Debug = function() {

	this.id = 'debug';

	// Create menu
	$('#game').append($('<div>').attr('id', this.id)
		.append($('<h3>').text("Debug Menu"))
	);

	// Add buttons
	this.addButton("Start Game", "CATAN.server.emit('startGame')");

	this.addButton("Build", "CATAN.server.emit('startBuild')");
	this.addButton("Trade", "CATAN.server.emit('trade')");
	this.addButton("Exchange", "CATAN.server.emit('exchange')");
	this.addButton("Roll Dice", "CATAN.server.emit('rollDice')");
	this.addButton("End Turn", "CATAN.server.emit('endTurn')");

};

Debug.prototype = CATAN.GUI.create('Panel');

Debug.prototype.addButton = function(text,cmd) {
	$('#'+this.id).append($('<button>')
		.text(text)
		.attr('onclick',cmd)
	);
}

CATAN.GUI.register( "Debug", Debug );