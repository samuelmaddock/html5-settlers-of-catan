var Players = function() {

	this.id = 'players';

	this.list = [];

	$('#game').append($('<div>').attr('id', this.id));

};

Players.prototype = CATAN.GUI.create('Panel');

Players.prototype.addPlayer = function(ply) {

	$('#'+this.id).append($('<div>').attr('id', ply.getID()).attr('class', 'player')
		.append($('<div>').attr('class', 'frame')
			.append($('<div>').attr('class', 'avatar')
				.css('background-color', ply.getColorHex())
			)
		)
		.append($('<div>').attr('class','name')
			.text(ply.getName())
		)
	);

}

Players.prototype.refresh = function() {

	for(var i in CATAN.Players) {
		var ply = CATAN.Players[i];
		var element = $('#'+ply.getID());
		if(element.length == 0) {
			this.addPlayer(ply);
		}
	}

	var panels = $('.player');
	for(var i=0; i < panels.length; i++) {

		var bFound = false;
		var id = panels[i].id;

		for(var j in CATAN.Players) {
			if(CATAN.Players[j].getID() == id) {
				console.log(CATAN.Players[j].getID() + " == " + id);
				bFound = true;
				break;
			}
		}

		if(!bFound) {
			$('#'+id).remove();
		}

	}

}

CATAN.GUI.register( "Players", Players );