var Lobby = function() {

	this.id = 'lobby';

	// Lobby div
	$("body").append($('<div>').attr('id', this.id).attr('class','clearfix')
		.append($('<div>').attr('id', this.id+'-content-head'))
		.append($('<div>').attr('id', this.id+'-content-main').attr('class','clearfix')
			.append($('<div>').attr('id', this.id+'-content-left'))
			.append($('<div>').attr('id', this.id+'-content-right'))
		)
	);

	// Server list
	$('#'+this.id+'-content-left').append($('<div>').attr('id','servers')
		.append($('<table>').attr('id', 'serverlist')
			.append($('<thead>')
				.append($('<tr>')
					.append($('<td>').attr('class', 'name').text('Name'))
					.append($('<td>').attr('class', 'players').text('Schema'))
					.append($('<td>').attr('class', 'players').text('Players'))
				)
			)
			.append($('<tbody>'))
		)
	);

	var serverName = (localStorage && localStorage.ServerName) ? localStorage.ServerName : "Settlers of Catan";

	$('#'+this.id+'-content-right')
		// Create a server
		.append($('<form>')
			.append($('<h1>').text('Create a server:'))
			.append($('<input>')
				.attr('id', 'servername')
				.attr('value', serverName)
				.attr('maxlength', '64')
				.change( function() {
					if(localStorage) {
						localStorage.ServerName = $('#servername').val();
					}
				})
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
		)
		// Player name
		.append($('<input>')
			.attr('id', 'plyname')
			.attr('maxlength', '32')
			.attr('value', CATAN.getName())
			.change( function() {
				if(localStorage) {
					localStorage.Name = $('#plyname').val();
				}
				CATAN.socket.emit('changeName', { name: CATAN.getName() } );
			})
		)

};

Lobby.prototype = CATAN.GUI.create('Panel');

Lobby.prototype.serverUpdate = function(server) {

	if(server.status == 'start') {
		CATAN.Lobby.addServer(server.info);
	}

	if(server.status == 'shutdown') {
		$('#'+server.info.id).remove();
	}

}

var row = 0;
Lobby.prototype.addServer = function(server) {

	$("#serverlist").find('tbody')
		.append($('<tr>').attr('class', 'row'+row).attr('id', server.id)
			.append($('<td>').attr('class', 'name')
				.append($('<a>').attr('href', './#'+server.id).attr('onclick', 'CATAN.connectToServer(event)')
					.text(server.name))
				)
			.append($('<td>').attr('class', 'players').text(server.schema))
			.append($('<td>').attr('class', 'players').text(server.players+'/'+server.max))
		);

	row = 1 - row;

};

Lobby.prototype.loadServerList = function(data, type) {

	for(var i in data.Servers) {
		CATAN.Lobby.addServer(data.Servers[i]);
	};

};

CATAN.GUI.register( "Lobby", Lobby );