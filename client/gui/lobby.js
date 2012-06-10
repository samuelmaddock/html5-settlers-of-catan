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

Lobby.prototype.loadServerList = function(data, type) {

	$('#plyname').attr('value', data.name );

	var row = 0;
	for(var i in data.Servers) {
		var s = data.Servers[i];

		$("#serverlist").find('tbody')
			.append($('<tr>').attr('class', 'row'+row)
				.append($('<td>').attr('class', 'name')
					.append($('<a>').attr('id', s.id).attr('href', './#'+s.id).attr('onclick', 'CATAN.connectToServer(event)')
						.text(s.name))
					)
				.append($('<td>').attr('class', 'players').text(s.schema))
				.append($('<td>').attr('class', 'players').text(s.players+'/'+s.max))
			);

		row = 1 - row;
	};

};

CATAN.GUI.register( "Lobby", Lobby );