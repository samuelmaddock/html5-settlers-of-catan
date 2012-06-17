CATAN.Players = [];

CATAN.Notify = function(data) {

	if(window.webkitNotifications) {

		if(window.webkitNotifications.checkPermission() == 0) {

			var timeout = data.timeout ? data.timeout : 10000,
				note;
			
			if(!data.type || data.type == "default") {
				var icon = data.icon ? data.icon : '',
					title = data.title ? data.title : T("#Title"),
					subtitle = data.subtitle ? data.subtitle : "";
				note = window.webkitNotifications.createNotification(icon,title,subtitle);
			} else if(data.type == "html") {
				var url = data.url ? data.url : "http://google.com/" // replace with 404 page later
				note = window.webkitNotifications.createHTMLNotification(data.url);
			}

			note.show();
			setTimeout(function(){note.cancel()},timeout);

		} else {
			window.webkitNotifications.requestPermission(this.Notify);
		}

	} else {
		//alert("Please update your browser.");
	}

}

CATAN.getName = function() {
	return (localStorage && localStorage.Name) ? localStorage.Name : T("#DefaultName");
}

CATAN.getSchema = function() {
	return this.Schemas["Classic"]; // static for now
}

CATAN.addPlayer = function(data, bChat) {
	var ply = new CATAN.Player();
	ply.id = data.id;
	ply.name = data.name;
	ply.address = data.address;
	ply.color = data.color;

	this.Players.push(ply);

	if(ply.id == this.server.socket.sessionid) {
		CATAN.LocalPlayer = ply;
	} else if(bChat) {
		this.chat.AddLine( T("#PlayerConnect", ply.getName(), ply.address.address, ply.address.port) );
	}

	this.Game.players.refresh();
}

CATAN.removePlayer = function(ply) {

	for(var i in this.Players) {
		if(this.Players[i].getID() == ply.getID()) {
			this.Players.splice(i,1);
		}
	}

	this.Game.players.refresh();

}

CATAN.getPlayerById = function(id) {
	for(var i in this.Players) {
		if(this.Players[i].getID() == id) {
			return this.Players[i];
		}
	}
}

CATAN.mouseRayTrace = function( event ) {

	//if(onTurn != true) return; // TODO: prevent tracing while not client's turn

	var camera = CATAN.Game.camera;
	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

	CATAN.Game.controls.projector.unprojectVector( vector, CATAN.Game.camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
	var intersects = ray.intersectObjects( CATAN.Game.collisionObjects );

	var hitObject = intersects[0];
	if(hitObject) {
	
		var ent = hitObject.object.Parent;

		if ((ent.Building !== undefined) && (ent.visible == true)) {
			return ent;
		};
		
		//CATAN.Game.lastSelection = hitObject.object;
		
	};

};