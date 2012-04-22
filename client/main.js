var CLIENT = true;
var SERVER = false;

var container, stats;
var camera, scene, projector, renderer;
var composer, renderTarget;
var cameraSkybox, sceneSkybox, skyboxTarget;
var skyboxMesh, textureSkybox;
var mesh;

var projector = new THREE.Projector();
var collisionObjects = [];
var lastSelection;

var precached = 0,
totalPrecached = 0;

precacheModels();


// TODO: make this more dynamic
function precacheModels() {
	
	CATAN.setSchema("Classic");

	document.getElementById("game").innerHTML = "<center><font size=72>PRECACHING...</font></center>";

	console.log("PRECACHING MODELS...");

	function precacheFinished() {
		precached++;
		if (precached == totalPrecached) {		
			console.log("DONE!");
			document.getElementById("game").innerHTML = null;
			
			init();
			animate();
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

function init() {

	container = document.createElement( 'div' );
	document.getElementById("game").appendChild( container );

	createCamera();
	createControls();
	createLighting();
	createSkybox();

	//BOARD.setupBoard();
	
	createWater();
	//createGrid();
	//createHexGrid();
	
	//
	
	renderer = new THREE.WebGLRenderer( { clearColor: 0x00aaff, clearAlpha: 1, antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	container.appendChild(renderer.domElement);
	
	//applyPostProcessing();

	//

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
	
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown', mouseTraceOnDown, false);

}

function createCamera() {

	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
	
	scene.add( camera );
	
}

function createControls() {

	controls = new THREE.SphereControls( camera );
	controls.radius = 500
	//controls.target = camera.target;
	
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

/*function createGrid() {

	var plane = new THREE.Mesh(new THREE.PlaneGeometry(500,500,20,20),
		new THREE.MeshLambertMaterial({ color: 0x444444, wireframe: true }));
		
	plane.rotation.x = -Math.PI/2;
	
	scene.add(plane);
	
}

function createHexGrid() {
	
	var board = BOARD;
	var cells = board.getCellGeometry();
	
	for ( var i = 0; i < cells.length; i++ ) {
		scene.add( cells[i] );
	}
	
}*/

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
	
}

function mouseTraceOnDown(event)
{
	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
	var intersects = ray.intersectObjects( collisionObjects );

	var hitObject = intersects[0];
	if(hitObject) {
	
		var parent = hitObject.object.Parent

		if (parent.Building !== undefined) {
			socket.emit('setupBuilding', {
				id: parent.Id,
				building: parent.Building
			});
		}
		
		lastSelection = hitObject.object;
		
	}
}

function onWindowResize( event ) {

	halfWidth = window.innerWidth / 2;
	halfHeight = window.innerHeight / 2;

	renderer.setSize( window.innerWidth, window.innerHeight );

	cameraSkybox.aspect = window.innerWidth / window.innerHeight;
	cameraSkybox.updateProjectionMatrix();

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

}

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
	
	//composer.render( 0.1 );
	
}