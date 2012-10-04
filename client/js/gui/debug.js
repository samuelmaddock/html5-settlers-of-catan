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
	this.addButton("Buy Dev Card", "CATAN.server.emit('buyDevCard')");

	$('#'+this.id).append(
		$('<div>').attr('id', 'stats')
	)

};

Debug.prototype = CATAN.GUI.create('Panel');

Debug.prototype.addButton = function(text,cmd) {
	$('#'+this.id).append($('<button>')
		.text(text)
		.attr('onclick',cmd)
	);
}

Debug.prototype.updateStats = function() {
	$('#stats').empty();

	for(var i=0; i < 6; i++) {
		$('#stats').append($('<p>')
			.text("Resource #"+i+" "+CATAN.LocalPlayer.getNumResource(i))
		)
	}
}

CATAN.GUI.register( "Debug", Debug );