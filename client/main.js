/* --------------------------------------------
	OLD
-------------------------------------------- */

var CLIENT = true;
var SERVER = false;
//var IP = 'http://catan.nodester.com:80/';
var IP = 'http://127.0.0.1:80/';

CATAN._init = function() {

	this.Lobby = this.GUI.create('Lobby');

	// Connect to lobby
	this.socket = io.connect(IP);
	this.socket.on( 'loadServerList',	this.loadServerList );
	this.socket.on( 'serverReady', function(data) {
		CATAN.connectToServer(data.id);
	});


	var hash = window.location.hash.toString().substr(1,5);
	if(hash !== "") {
		this.connectToServer(hash);
	}

};

CATAN.createServer = function() {

	// Create server list html
	this.socket.emit('createServer', {
		name: $("#name").attr('value'),
		schema: $("#schema").attr('value'),
		public: ($("#public").attr('checked') == 'checked')
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

	this.server = io.connect(IP + id);
	this.setupSocket(this.server);

	window.location.hash = id;

};

CATAN.onConnection = function() {
	this.server.emit( 'playerReady', {} );

	this.chat = this.GUI.create("Chatbox");
};

CATAN.setupGame = function() {

	this.Lobby.remove();

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

	socket.on('syncPlayer', function (data) {
		CATAN.addPlayer(data,false)
	});

	socket.on('boardEntities', function (data) {

		for(var i in data.ents) {
			CATAN.create(data.type, data.ents[i]);
		}

	});

	socket.on('setupBuild', function (data) {

		collisionObjects.length = 0

		for(var i in data.available) {
			var ent = CATAN.getEntById(data.available[i]);
			ent.show(0.33);
			collisionObjects.push( ent.Collision );
		}

	});

	socket.on('PlayerJoin', function (data) {
		CATAN.addPlayer(data,true)
	});

	socket.on('PlayerLeave', function (data) {
		var ply = CATAN.getPlayerById(data.id);
		self.chat.AddLine(ply.getName() + " has disconnected");
	});

	socket.on('PlayerChat', function (data) {
		data.ply = CATAN.getPlayerById(data.id);
		self.chat.AddLine(data, "player");
	});

	socket.on('PlayerBuild', function (data) {
		var ply = CATAN.getPlayerById(data.id),
			ent = CATAN.getEntById(data.entid);

		ent.setOwner(ply);

		// End build
		if( ply.getID() == CATAN.LocalPlayer.getID() ) {
			for(var i in CATAN.Entities) {
				var ent2 = CATAN.Entities[i];
				if(!ent2.hasOwner()) {
					ent2.hide();
				}
			}
		}
	});

	socket.on('GameUpdate', function (data) {
		if(data.error) {
			self.chat.AddLine(data.message);
		} else {
			self.chat.AddLine(data.message);
		}
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