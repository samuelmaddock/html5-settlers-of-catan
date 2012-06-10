/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 *
 * SphereControl Authors:
 * @author Guillaume Masse / http://masgui.wikidot.com
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CatanControls = function ( object, domElement ) {
	
	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	this.isMouseDown = false;
	this.onMouseDownPosition = new THREE.Vector2(0,0);
	
	this.radius = 500;
	this.minRadius = 380;
	this.maxRadius = 1220;
	
	this.theta = 45;
	this.onMouseDownTheta = this.theta;
	
	this.phi = 45;
	this.onMouseDownPhi = this.phi;

	this.projector = new THREE.Projector();
	
	this.onMouseDown = function( event ) {

		this.isMouseDown = true;

		if(CATAN.chat.enabled) {
			return;
		} else {

			event.preventDefault();

			// usefull ?
			this.onMouseDownTheta = this.theta;
			this.onMouseDownPhi = this.phi;
			
			this.onMouseDownPosition.x = event.clientX;
			this.onMouseDownPosition.y = event.clientY;

		};

	};
	
	this.onMouseMove = function( event ) {

		if( !this.isMouseDown ) return;

		if(CATAN.chat.enabled) {
			return;
		} else {

			event.preventDefault();

			this.theta = - ( ( event.clientX - this.onMouseDownPosition.x ) * 0.5 ) + this.onMouseDownTheta;
			this.phi = ( ( event.clientY - this.onMouseDownPosition.y ) * 0.5 ) + this.onMouseDownPhi;
			this.phi = Math.min( 180, Math.max( 0, this.phi ) );

		};

	};
	
	this.onMouseUp = function( event ) {

		this.isMouseDown = false;

		if(CATAN.chat.enabled) {
			return;
		} else {

			event.preventDefault();

			this.onMouseDownPosition.x = event.clientX - this.onMouseDownPosition.x;
			this.onMouseDownPosition.y = event.clientY - this.onMouseDownPosition.y;

			// Make sure the player didn't drag their mouse
			if(this.onMouseDownPosition.x == 0 && this.onMouseDownPosition.y == 0) {
				this.mouseRayTrace(event);
			};

		};

	};
	
	this.onMouseWheel = function( event ) {

		if(CATAN.chat.enabled) {
			return;
		} else {
			var newRadius = this.radius - event.wheelDeltaY;
			this.radius = THREE.Math.clamp( newRadius, this.minRadius, this.maxRadius );
		}
		
	};
	
	this.update = function( ) {

		this.object.position.x 
			= this.radius 
			* Math.sin( this.theta * Math.PI / 360 ) 
			* Math.cos( this.phi * Math.PI / 360 );
			
		this.object.position.y 
			= this.radius 
			* Math.sin( this.phi * Math.PI / 360 );
			
		this.object.position.z 
			= this.radius 
			* Math.cos( this.theta * Math.PI / 360 ) 
			* Math.cos( this.phi * Math.PI / 360 );
		
		this.object.lookAt( this.target );
		this.object.updateMatrix();

	};
	
	this.onContextMenu = function( event ) {

		if(CATAN.chat.enabled) {
			return;
		} else {

			event.preventDefault();

		};
		
	};
	
	this.onKeyUp = function( event ) {

		// Chat Toggle: Enter
		if(event.which == 13) {
			CATAN.chat.Toggle();
		};

		// Fullscreen: +/-
		if(event.which == 187 || event.which == 189) {
			var elem = document.getElementById('game');
			if(elem.requestFullScreen) {
				if(elem.fullScreen) {
					elem.cancelFullScreen();
				} else {
					elem.requestFullScreen();
					elem.fullScreenKeyboardInputAllowed = true;
				}
			}
			if(elem.webkitRequestFullScreen) {
				if(elem.webkitIsFullScreen) {
					elem.webkitCancelFullScreen();
				} else {
					elem.webkitRequestFullScreen();
					elem.webkitFullScreenKeyboardInputAllowed = true;
				}
			}
			if(elem.mozRequestFullScreen) {
				if(elem.mozfullScreen) {
					elem.mozCancelFullScreen();
				} else {
					elem.requestFullScreenWithKeys();
				}
			}
		};
		
	};

	this.mouseRayTrace = function( event ) {

		//if(onTurn != true) return; // TODO: prevent tracing while not client's turn

		var camera = CATAN.Game.camera;

		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

		this.projector.unprojectVector( vector, CATAN.Game.camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		var intersects = ray.intersectObjects( CATAN.Game.collisionObjects );

		var hitObject = intersects[0];
		if(hitObject) {
		
			var ent = hitObject.object.Parent;

			if ((ent.Building !== undefined) && (ent.visible == true)) {

				//console.log("Pressed Entity " + ent.getEntId());

				CATAN.server.emit('playerBuild', {
					id: ent.getEntId()
				});

			};
			
			CATAN.Game.lastSelection = hitObject.object;
			
		};

	};
	
	this.domElement.addEventListener( 'contextmenu', bind( this, this.onContextMenu ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'mousewheel', bind( this, this.onMouseWheel ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};
	};
};