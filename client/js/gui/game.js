var Game = function() {

	this.id = 'game';

	this.collisionObjects = [];
	this.lastSelection;

	this.container = document.createElement("div");
	$('#game').append( this.container );

	// Environment
	this.createCamera();
	this.createControls();
	this.createLighting();
	//this.createSkybox();
	//this.createWater();
	
	// WebGL Renderer
	//this.renderer = new THREE.WebGLRenderer( { clearColor: 0x00aaff, clearAlpha: 1, antialias: true } );
	this.renderer = new THREE.WebGLRenderer( { clearColor: 0x00183B, clearAlpha: 1, antialias: true } );
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.renderer.autoClear = false;

	this.container.appendChild(this.renderer.domElement);

	// Stats.js fps counter
	/*this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.container.appendChild( this.stats.domElement );*/
	
	// Fill web browser
	window.addEventListener( 'resize', function ( event ) {

		halfWidth = window.innerWidth / 2;
		halfHeight = window.innerHeight / 2;

		CATAN.Game.renderer.setSize( window.innerWidth, window.innerHeight );

		if(CATAN.Game.cameraSkybox) {
			CATAN.Game.cameraSkybox.aspect = window.innerWidth / window.innerHeight;
			CATAN.Game.cameraSkybox.updateProjectionMatrix();
		}

		CATAN.Game.camera.aspect = window.innerWidth / window.innerHeight;
		CATAN.Game.camera.updateProjectionMatrix();

	}, false );

	// Create sub-gui menus
	this.players = CATAN.GUI.create('Players');

};

Game.prototype = CATAN.GUI.create('Panel');

Game.prototype.createCamera = function() {

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
	this.scene.add( this.camera );
	
}

Game.prototype.createControls = function() {

	this.controls = new THREE.CatanControls( this.camera );
	
}

Game.prototype.createLighting = function() {

	var light = new THREE.DirectionalLight( 0xefefff, 2 );
	light.position.set( 1, 1, 1 ).normalize();
	this.scene.add( light );

	var light = new THREE.DirectionalLight( 0xffefef, 2 );
	light.position.set( -1, -1, -1 ).normalize();
	this.scene.add( light );
	
}

Game.prototype.createSkybox = function() {

	this.sceneSkybox = new THREE.Scene();
	
	// CAMERA
	this.cameraSkybox = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
	this.skyboxTarget = new THREE.Vector3( 0, 0, 0 );
	
	this.sceneSkybox.add( this.cameraSkybox );
	
	var path = "materials/skybox/blue01";
	var format = '.png';
	var urls = [
		path + 'ft' + format, path + 'bk' + format,
		path + 'up' + format, path + 'dn' + format,
		path + 'rt' + format, path + 'lf' + format
	];

	this.textureSkybox = THREE.ImageUtils.loadTextureCube( urls );
	
	var shader = THREE.ShaderUtils.lib[ "cube" ];
	shader.uniforms[ "tCube" ].texture = this.textureSkybox;

	var material = new THREE.ShaderMaterial({

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false

	});

	this.skyboxMesh = new THREE.Mesh( new THREE.CubeGeometry( 1000, 1000, 1000, 1, 1, 1, null, false ), material );
	this.skyboxMesh.flipSided = true;
	this.sceneSkybox.add( this.skyboxMesh );
	
}

Game.prototype.createWater = function() {

	// so beautiful :v
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(30000,30000,20,20),
		new THREE.MeshLambertMaterial({ color: 0x7EC1DE, wireframe: true }));
		
	plane.position.y = -1;
	plane.rotation.x = -Math.PI/2;
	
	this.scene.add(plane);
	
}

/*
var composer, renderTarget;
Game.prototype.applyPostProcessing = function() {
	
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

Game.prototype.animate = function() {

	requestAnimationFrame( CATAN.Game.animate );
	
	CATAN.Game.render();
	//CATAN.Game.stats.update();

}

Game.prototype.render = function() {

	this.controls.update();

	this.renderer.clear();
	
	if(this.sceneSkybox) {
		this.skyboxTarget.x = -this.camera.position.x;
		this.skyboxTarget.y = -this.camera.position.y;
		this.skyboxTarget.z = -this.camera.position.z;

		this.cameraSkybox.lookAt( this.skyboxTarget );

		this.renderer.render( this.sceneSkybox, this.cameraSkybox );
	}
	
	this.renderer.render( this.scene, this.camera );
	
}

CATAN.GUI.register( "Game", Game );