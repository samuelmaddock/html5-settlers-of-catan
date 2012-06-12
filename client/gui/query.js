var Query = function() {

	this.id = 'query';

	// Create menu
	$('#game').append($('<div>').attr('id', this.id));

};

Query.prototype = CATAN.GUI.create('Panel');

Query.prototype.request = function(text) {
	$('#'+this.id).append($('<p>').text(text)
		.append($('<input>').attr('type', 'text').attr('id','queryEntry'))
		.append($('<button>').attr('onclick','CATAN.query.onClick')
			.text('Submit')
		)
	)
}

Query.prototype.onClick = function() {
	var text = $('#queryEntry').text()
	// do something
}

CATAN.GUI.register( "Query", Query );