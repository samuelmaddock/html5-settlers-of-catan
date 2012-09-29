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

		if(CATAN.chat.enabled) return;

		event.preventDefault();

		// usefull ?
		this.onMouseDownTheta = this.theta;
		this.onMouseDownPhi = this.phi;
		
		this.onMouseDownPosition.x = event.clientX;
		this.onMouseDownPosition.y = event.clientY;

	};
	
	this.onMouseMove = function( event ) {

		if(this.isMouseDown) {

			if(CATAN.chat.enabled) return;

			event.preventDefault();

			$('body').css('cursor','move');

			this.theta = - ( ( event.clientX - this.onMouseDownPosition.x ) * 0.5 ) + this.onMouseDownTheta;
			this.phi = ( ( event.clientY - this.onMouseDownPosition.y ) * 0.5 ) + this.onMouseDownPhi;
			this.phi = Math.min( 180, Math.max( 0, this.phi ) );

		} else {

			// Entity hovering
			var ent = CATAN.mouseRayTrace(event);

			if(ent) {

				if(!this.lastTraceHit) {
					ent.onHoverStart();
				} else {
					if(this.lastTraceEnt && ent != this.lastTraceEnt) {
						this.lastTraceEnt.onHoverEnd();
						ent.onHoverStart();
					} else {
						ent.onHover();
					}
				}

				this.lastTraceEnt = ent;
				this.lastTraceHit = true;

			} else {

				if(this.lastTraceHit) {
					this.lastTraceEnt.onHoverEnd();
				}

				this.lastTraceHit = false;

			}

		}


	};
	
	this.onMouseUp = function( event ) {

		this.isMouseDown = false;
			
		$('body').css('cursor','default');

		if(CATAN.chat.enabled) return;

		event.preventDefault();

		this.onMouseDownPosition.x = event.clientX - this.onMouseDownPosition.x;
		this.onMouseDownPosition.y = event.clientY - this.onMouseDownPosition.y;

		// Make sure the player didn't drag their mouse
		if(this.onMouseDownPosition.x == 0 && this.onMouseDownPosition.y == 0) {

			var ent = CATAN.mouseRayTrace(event);

			if(ent) {
				CATAN.onSelectEntity(ent);
			}

		};

	};
	
	this.onMouseWheel = function( event ) {

		if(CATAN.chat.enabled) return;

		var newRadius = this.radius - event.wheelDeltaY;
		this.radius = THREE.Math.clamp( newRadius, this.minRadius, this.maxRadius );
		
	};
	
	this.update = function( ) {

		if(Gamepad.supported) {
			this.updateGamepad();
		}

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

		if(CATAN.chat.enabled) return;

		event.preventDefault();
		
	};
	
	this.onKeyUp = function( event ) {

		// Chat Toggle: Enter
		if(event.which == 13) {
			CATAN.chat.Toggle();
		};

		// Fullscreen: +/-
		if(event.which == 187 || event.which == 189) {
			this.requestFullscreen();
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

	/* Fullscreen API */
	this.requestFullscreen = function() {

		// Standard
		var elem = document.getElementById('game');
		if(elem.requestFullScreen) {
			if(elem.fullScreen) {
				elem.cancelFullScreen();
			} else {
				elem.requestFullScreen();
				elem.fullScreenKeyboardInputAllowed = true;
			}
		}

		// Webkit
		if(elem.webkitRequestFullScreen) {
			if(elem.webkitIsFullScreen) {
				elem.webkitCancelFullScreen();
			} else {
				elem.webkitRequestFullScreen();
				elem.webkitFullScreenKeyboardInputAllowed = true;
			}
		}

		// Mozilla
		if(elem.mozRequestFullScreen) {
			if(elem.mozfullScreen) {
				elem.mozCancelFullScreen();
			} else {
				elem.requestFullScreenWithKeys();
			}
		}

	}

	/* Gamepad API Testing */
	this.updateGamepad = function() {
		var pads = Gamepad.getStates();
		for (var i = 0; i < pads.length; ++i) {
			var pad = pads[i];
			if (pad) {

				// Thumbstick move
				var xdelta = - ( ( -(pad.rightStickX+1)*100 ) * 0.5 ),
					ydelta = ( ( -pad.rightStickY*100 ) * 0.5 );
				this.theta = xdelta + this.onMouseDownTheta;
				this.phi = ydelta + this.onMouseDownPhi;
				this.phi = Math.min( 180, Math.max( 0, this.phi ) );

				// Trigger zoom
				var diffZoom = pad.leftShoulder1*20 - pad.rightShoulder1*20
				this.radius = THREE.Math.clamp( this.radius + diffZoom, this.minRadius, this.maxRadius );

			}
		}
	}

};