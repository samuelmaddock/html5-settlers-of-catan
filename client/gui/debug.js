var Debug = function() {

	this.id = 'debug';

	// Create menu
	$('#game').append($('<div>').attr('id', this.id)
		.append($('<h3>').text("Debug Menu"))
	);

	// Add buttons
	this.addButton("Start Game", "CATAN.server.emit('startGame')");

};

Debug.prototype = CATAN.GUI.create('Panel');

Debug.prototype.addButton = function(text,cmd) {
	$('#'+this.id).append($('<button>')
		.text(text)
		.attr('onclick',cmd)
	);
}

CATAN.GUI.register( "Debug", Debug );