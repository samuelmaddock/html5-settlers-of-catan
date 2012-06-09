var Lobby = function() {

	this.id = 'lobby';

	// Lobby div
	$("body").append($('<div>').attr('id', this.id));

	// Player name
	$('#lobby').append($('<input>')
		.attr('id', 'plyname')
		.attr('maxlength', '32')
		.change( function() {
			CATAN.socket.emit('changeName', { name: $('#plyname').val() } );
		})
	);

	// Server list
	$('#lobby').append($('<table>').attr('id', 'serverlist')
		.append($('<thead>')
			.append($('<tr>')
				.append($('<td>').attr('class', 'name').text('Name'))
				.append($('<td>').attr('class', 'players').text('Schema'))
				.append($('<td>').attr('class', 'players').text('Players'))
			)
		)
		.append($('<tbody>'))
	);

	// Create a server
	$('#lobby').append($('<form>')
		.append($('<h1>').text('Create a server:'))
		.append($('<input>')
			.attr('id', 'name')
			.attr('value', 'Settlers of Catan')
			.attr('maxlength', '64')
		)
		.append($('<select>')
			.attr('id', 'schema')
			.append($('<option>')
				.attr('value', 'Classic')
				.text('Classic')
			)
		)
		.append($('<input>')
			.attr('id', 'public')
			.attr('type', 'checkbox')
			.attr('value', 'public')
			.attr('checked', 'true')
			.text('Public')
		)
		.append($('<input>')
			.attr('type', 'button')
			.attr('value', 'Connect')
			.attr('onclick', 'CATAN.createServer()')
		)
	);

};

Lobby.prototype = new CATAN.GUI.create('Panel');

Lobby.prototype.AddServer = function(data, type) {

	var id, text;

	if(type == "player") { // message sent by player

		id = "cl_" + (this.log.length + 1);
		text = this.Cleanse(data.Text);

		var col = this.Hex2String(data.ply.getColor());

		$('#log').append('<table id="' + id + '" class="chatline"><tr><td class="name" style="color: ' + col + ';">' + data.ply.getName() + '</td><td>' + text + '</td></tr></table>');
		
		this.log.push({ Name: data.ply.getName(), Text: text })

	} else { // message sent from server

		id = "cl_" + (this.log.length + 1);
		text = this.Cleanse(data);

		$('#log').append('<table id="' + id + '" class="chatline note"><tr><td>' + text + '</td></tr></table>');

		this.log.push({ Text: text });

	}

	// fade out messages
	setTimeout(function() {
		$('#' + id).fadeOut();
	}, this.fadeTimeout );

	// Send scrollbar to the bottom
	var log = document.getElementById("log");
	log.scrollTop = log.scrollHeight;

};

CATAN.GUI.register( "Lobby", Lobby );