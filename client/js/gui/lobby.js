var Lobby = function() {

	this.id = 'lobby';
	this.row = 0;
	this.lastRequest = 0;

	// Lobby div
	$("body").append($('<div>').attr('id', this.id).attr('class','clearfix')
		.append($('<div>').attr('id', this.id+'-content').attr('class','clearfix')
			.append($('<div>').attr('id', this.id+'-content-header').text(T('Title')))
			.append($('<div>').attr('id', this.id+'-content-main').attr('class','clearfix')
				.append($('<div>').attr('id', this.id+'-content-left'))
				.append($('<div>').attr('id', this.id+'-content-right'))
			)
			.append($('<div>').attr('id', this.id+'-content-footer'))
		)
	);

	// Server list
	$('#'+this.id+'-content-left').append($('<div>').attr('id','servers').attr('class','content-box')
		.append($('<h3>').text(T('ServerList')))
		.append($('<table>').attr('id', 'serverlist')
			.append($('<thead>')
				.append($('<tr>')
					.append($('<td>').attr('class', 'name').text(T('ServerListName')))
					.append($('<td>').attr('class', 'players').text(T('ServerListSchema')))
					.append($('<td>').attr('class', 'players').text(T('ServerListPlayers')))
				)
			)
			.append($('<tbody>'))
		)
		.append($('<input>')
			.attr('type', 'button')
			.attr('value', T('ServerListRefresh'))
			.attr('onclick', 'CATAN.Lobby.refresh()')
		)
	);

	var serverName = (localStorage && localStorage.ServerName) ? localStorage.ServerName : "Settlers of Catan";

	$('#'+this.id+'-content-right')

		// Player name
		.append($('<div>').attr('class','content-box')
			//.append($('<h3>').text('Name'))
			.append($('<input>')
				.attr('id', 'plyname')
				.attr('class', 'playername')
				.attr('type', 'text')
				.attr('maxlength', '32')
				.attr('spellcheck', 'false')
				.attr('placeholder', T('PlayerNamePlaceholder'))
				.change( function() {
					if(localStorage) {
						localStorage.Name = $('#plyname').val();
					}
					CATAN.socket.emit('changeName', { name: CATAN.getName() } );
				})
			)
		)

		// Create a server
		.append($('<div>').attr('class','content-box')
			.append($('<h3>').text(T('ServerCreate')))
			.append($('<form>')
				.append($('<input>')
					.attr('type', 'text')
					.attr('id', 'servername')
					.attr('placeholder', T('ServerNamePlaceholder'))
					.attr('maxlength', '64')
					.change( function() {
						if(localStorage) {
							localStorage.ServerName = $('#servername').val();
						}
					})
				)
				.append($('<fieldset>')
					.append($('<legend>').text(T('Configuration')))
					.append($('<select>')
						.attr('type', 'text')
						.attr('id', 'schema')
						.append($('<option>')
							.attr('value', 'Classic')
							.text(T('SchemaClassic'))
						)
					)
					.append($('<input>')
						.attr('id', 'public')
						.attr('type', 'checkbox')
						.attr('value', 'public')
						.attr('checked', 'true')
					)
					.append($('<label>')
						.attr('for', 'public')
						.text(T('ServerPublic'))
					)
				)
				.append($('<input>')
					.attr('type', 'button')
					.attr('value', T('ServerConnect'))
					.attr('onclick', 'CATAN.createServer()')
				)
			)
		);


	if(localStorage) {
		if(localStorage.Name) {
			$('#plyname').attr('value', CATAN.getName());
		} else if(localStorage.ServerName) {
			$('#servername').attr('value', localStorage.ServerName);
		}
	}

	this.refresh();
};

Lobby.prototype = CATAN.GUI.create('Panel');

Lobby.prototype.addServer = function(server) {
	$("#serverlist").find('tbody')
		.append($('<tr>').attr('class', 'row'+this.row).attr('id', server.id)
			.append($('<td>').attr('class', 'name')
				.append($('<a>').attr('href', './#'+server.id).attr('onclick', 'CATAN.connectToServer(event,true)')
					.text(server.name)
				)
			)
			.append($('<td>').attr('class', 'players').text(server.schema))
			.append($('<td>').attr('class', 'players').text(server.players+'/'+server.max))
		);

	this.row = 1 - this.row;
};

Lobby.prototype.loadServerList = function(data, type) {
	$("#serverlist").find('tbody').empty();
	for(var i in data.Servers) {
		CATAN.Lobby.addServer(data.Servers[i]);
	};
};

Lobby.prototype.refresh = function(data, type) {
	if(((new Date().getTime()) - this.lastRequest) < 3000) return;
	this.lastRequest = new Date().getTime();
	this.row = 0;
	CATAN.socket.emit('requestServerlist');
};

CATAN.GUI.register( "Lobby", Lobby );