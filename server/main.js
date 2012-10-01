/*-------------------------------
	Globals
-------------------------------*/
global._PORT = 80;

/*-------------------------------
	Catan
-------------------------------*/
require('./catan.js');

/*-------------------------------
	Web Server
-------------------------------*/
var http = require('http').createServer(handle),
	io = require('socket.io').listen(http),
	url = require('url'),
	fs = require('fs'),
	path = require('path'),
	util = require('util');

io.set('log level', 1);
http.listen(_PORT);

// Socket io reference
CATAN.setupSockets(io);

//process.setMaxListeners(0);

function debugOutput() {
	var content = '<h1>Settlers Of Catan v' + CATAN.VERSION + '</h1>';

	content += '<table>';
	content += '  <thead>';
	content += '    <tr><td>GUID</td><td>Name</td><td>Schema</td><td>Players</td></tr>';
	content += '  </thead>';
	content += '  <tbody>';

	content += CATAN.Games.getCount() + ' servers running.<br /><br />';
	for(var i=0; i < CATAN.Games.getCount(); i++) {
		var game = CATAN.Games.list[i];
		content += '<tr>';
		content += '<td>' + game.getID() + '</td>';
		content += '<td>' + game.name + '</td>';
		content += '<td>' + game.schema + '</td>';
		content += '<td>' + game.getNumPlayers() + '/' + game.getMaxPlayers() + '</td>';
		content += '</tr>';
	}

	content += '  </tbody>';
	content += '</table>';

	content += '<br />Available game schemas:<br />';
	for(var k in CATAN.Schemas.getAll()) {
		content += k + '<br />';
	}

	return content;
}

function handle(request, response) {

	var uri = url.parse(request.url).pathname;

	if(uri == '/debug') {
		var content = debugOutput();
		response.writeHead(404);
		response.end(content);
		return;
	}

	var filePath = uri;
	if (filePath == '/')
			filePath = '/index.html';

	var extname = path.extname(filePath);
	var contentType = 'text/html';
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
			case '.png':
				contentType = 'image/png';
				break;
	}

	// Route file directories for client and shared
	var dir = __dirname.substr(0, __dirname.length - 6);
	if(filePath.indexOf("shared/") != -1) {
		filePath = dir + filePath.substr(1,filePath.length);
	} else {
		filePath = dir + "client" + filePath;
	}

	path.exists(filePath, function(exists) {
		if(exists) {
			var readStream = fs.createReadStream(filePath);
			util.pump(readStream, response);
			/*fs.readFile(filePath, function(error, content) {
					if (error) {
							response.writeHead(500);
							response.end();
					} else {
							response.writeHead(200, { 'Content-Type': contentType });
							response.end(content, 'utf-8');
					}
			});*/
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});

};

console.log('Server started');