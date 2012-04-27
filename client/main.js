/* --------------------------------------------
	OLD
-------------------------------------------- */

var CLIENT = true;
var SERVER = false;
var IP = '198.82.86.39';

CATAN._init = function() {

	this.setupLobby();

	// Connect to lobby
	this.socket = io.connect('http://'+IP+':17153');
	this.socket.on( 'loadServerList',	this.loadServerList );
	this.socket.on( 'serverReady', function(data) {
		CATAN.connectToServer(data.id);
	});


	var hash = window.location.hash.toString().substr(1,5);
	if(hash !== "") {
		this.connectToServer(hash);
	}

};

CATAN.setupLobby = function() {

	// Lobby div
	$("body").append($('<div>').attr('id', 'lobby'));

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

CATAN.createServer = function() {

	// Create server list html
	this.socket.emit('createServer', {
		name: $("#name").attr('value'),
		schema: $("#schema").attr('value'),
		public: ( $("#public").attr('checked') == "checked" )
	});

};

CATAN.loadServerList = function(data) {

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

CATAN.connectToServer = function(id) {

	if(typeof id !== 'string') {
		var event = id || window.event;
		var target = event.target || event.srcElement;
		id = target.id;
	}

	this.chat = new Chatbox();

	this.server = io.connect('http://'+IP+':17153/' + id);
	this.setupSocket(this.server);

	window.location.hash = id;

};

CATAN.onConnection = function() {

	var socket = this.server;

	console.log("SENDING READY");
	console.log(socket);
	socket.emit( 'playerReady', {} );

};

CATAN.setupGame = function() {

	$('#lobby').remove();

	$('body').append($('<div>').attr('id', 'game'));

	this.precacheModels();

};

CATAN.setupSocket = function(socket) {

	var self = this;

	socket.on('connectionStatus', function(data) {

		if(data.success == true) {
			console.log("Successfully connected to server");
			CATAN.setupGame();
		} else {
			console.log(data.message);
		};

	});

	socket.on('boardTiles', function (data) {

		console.log("Received board tiles");

		var tiles = data.tiles;
		CATAN.Board.hexTiles = [];

		for(var i in tiles) {

			var tile = new CATAN.HexTile();
			tile.setPosition(tiles[i].pos);
			tile.setResource(tiles[i].resource);
			tile.setToken(tiles[i].token);
			tile.setupMesh();

			CATAN.Board.hexTiles.push(tile);

		}


	});

	/*socket.on('boardPieces', function (data) {

		var tiles = data.tiles;

		for(var i in tiles) {

			var tile = new CATAN.HexTile();
			tile.setPosition(tiles[i].pos);
			tile.setResource(tiles[i].resource);
			tile.setToken(tiles[i].token);

		}

	});

	socket.on('BoardCreated', function (data) {
		this.NET.Resources = data.Resources;
		this.NET.NumberTokens = data.NumberTokens;

		BOARD.setupBoard();

		for(var i=0; i < data.Buildings.length; i++) {
			var id = data.Buildings[i].id,
			type = data.Buildings[i].building,
			color = data.Buildings[i].color;
			
			var building = BOARD.getBuildingByID(id,type);
			
			var material = new THREE.MeshBasicMaterial({ color: color,
				opacity: 1
			});

			building.Collision.material = material;
		}
	});

	socket.on('SetupBuilding', function (data) {
		//console.log("Received Building: " + data.id + ", " + data.building)

		var building = BOARD.getBuildingByID(data.id, data.building);
		var material = new THREE.MeshBasicMaterial({ color: data.color,
			opacity: 1
		});

		building.Collision.material = material;
	});

	socket.on('BuildingReset', function (data) {
		//console.log("Received Building: " + data.id + ", " + data.building)

		var corner = BOARD.getBuildingByID(data.id, data.building)

		var material = new THREE.MeshBasicMaterial( {
			opacity: 0
		} )

		corner.Collision.material = material
	});*/

	socket.on('PlayerJoin', function (data) {
		self.chat.AddLine(data.Name + " has joined the game (" + data.Address.address + ":" + data.Address.port + ")")
	});

	socket.on('PlayerLeave', function (data) {
		self.chat.AddLine(data.Name + " has disconnected")
	});

	socket.on('ChatReceive', function (data) {
		self.chat.AddLine(data, "player")
	});

}

// TODO: make an asset manager
CATAN.precacheModels = function() {

	$('#game').html("<center><font size=72>PRECACHING...</font></center>");

	console.log("PRECACHING MODELS...");

	function precacheFinished() {
		precached++;
		if (precached == totalPrecached) {		
			console.log("DONE!");
			document.getElementById("game").innerHTML = null;
			
			init();
			animate();
			CATAN.onConnection();
		}
	}

	var resource = 0;
	function resourceFinished( geometry ) {
		CATAN.getSchema().Resources[resource].geometry = geometry;
		resource++;
		precacheFinished();
	}
	
	// Precache resources
	var loader = new THREE.JSONLoader( true );
	for ( var i = 0; i < NUM_RESOURCES; i++ ) {
		var res = CATAN.getSchema().Resources[i];
		loader.load( res.url, resourceFinished );
		totalPrecached++;
	}
	
	// Precache robber
	loader.load( CATAN.getSchema().Robber.url, function(geometry) {
		CATAN.getSchema().Robber.geometry = geometry;
		precacheFinished();
	});
	totalPrecached++;
	
}


/* --------------------------------------------
	OLD
-------------------------------------------- */

var container, stats;
var camera, scene, renderer;
var cameraSkybox, sceneSkybox, skyboxTarget;
var skyboxMesh, textureSkybox;
var mesh;

var collisionObjects = [];
var lastSelection;

var precached = 0,
totalPrecached = 0;

function init() {

	container = document.createElement( 'div' );
	$('#game').append( container );

	// Environment
	createCamera();
	createControls();
	createLighting();
	createSkybox();
	createWater();
	
	// WebGL Renderer
	renderer = new THREE.WebGLRenderer( { clearColor: 0x00aaff, clearAlpha: 1, antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	container.appendChild(renderer.domElement);

	// Stats.js fps counter
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
	
	// Fill web browser
	window.addEventListener( 'resize', function ( event ) {

		halfWidth = window.innerWidth / 2;
		halfHeight = window.innerHeight / 2;

		renderer.setSize( window.innerWidth, window.innerHeight );

		cameraSkybox.aspect = window.innerWidth / window.innerHeight;
		cameraSkybox.updateProjectionMatrix();

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

	}, false );

}

function createCamera() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
	scene.add( camera );
	
}

function createControls() {

	controls = new THREE.CatanControls( camera );
	
}

function createLighting() {

	var light = new THREE.DirectionalLight( 0xefefff, 2 );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffefef, 2 );
	light.position.set( -1, -1, -1 ).normalize();
	scene.add( light );
	
}

function createSkybox() {

	sceneSkybox = new THREE.Scene();
	
	// CAMERA
	cameraSkybox = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
	skyboxTarget = new THREE.Vector3( 0, 0, 0 );
	
	sceneSkybox.add( cameraSkybox );
	
	var path = "materials/skybox/blue01";
	var format = '.png';
	var urls = [
		path + 'ft' + format, path + 'bk' + format,
		path + 'up' + format, path + 'dn' + format,
		path + 'rt' + format, path + 'lf' + format
	];

	textureSkybox = THREE.ImageUtils.loadTextureCube( urls );
	
	var shader = THREE.ShaderUtils.lib[ "cube" ];
	shader.uniforms[ "tCube" ].texture = textureSkybox;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false

	} ),

	skyboxMesh = new THREE.Mesh( new THREE.CubeGeometry( 1000, 1000, 1000, 1, 1, 1, null, false ), material );
	skyboxMesh.flipSided = true;
	sceneSkybox.add( skyboxMesh );
	
}

function createWater() {

	// so beautiful :v
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(30000,30000,20,20),
		new THREE.MeshLambertMaterial({ color: 0x7EC1DE, wireframe: true }));
		
	plane.position.y = -1;
	plane.rotation.x = -Math.PI/2;
	
	scene.add(plane);
	
}

/*
var composer, renderTarget;
function applyPostProcessing() {
	
	var shaderVignette = THREE.ShaderExtras[ "vignette" ];
	var effectVignette = new THREE.ShaderPass( shaderVignette );
	
	effectVignette.uniforms[ "offset" ].value = 0.95;
	effectVignette.uniforms[ "darkness" ].value = 1.6;
	
	var rtParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: true };
	var renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, rtParameters )
	
	composer = new THREE.EffectComposer( renderer, renderTarget );
	
	var renderModel = new THREE.RenderPass( scene, camera );
	
	effectVignette.renderToScreen = true;
	
	composer = new THREE.EffectComposer( renderer, renderTarget );
	
	composer.addPass( effectVignette );
	
}*/

//

function animate() {

	requestAnimationFrame( animate );
	
	render();
	stats.update();

}

function render() {

	controls.update();
	
	skyboxTarget.x = - camera.position.x;
	skyboxTarget.y = - camera.position.y;
	skyboxTarget.z = - camera.position.z;

	cameraSkybox.lookAt( skyboxTarget );
	
	renderer.clear();
	renderer.render( sceneSkybox, cameraSkybox );
	renderer.render( scene, camera );
	
}