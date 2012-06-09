/* GUI Module */
CATAN.GUI = {}

CATAN.GUI.controls = [];

CATAN.GUI.create = function(name) {
	var control = CATAN.GUI.controls[name];
	if(control) {
		return new control();
	}
};

CATAN.GUI.register = function(name,control) {
	this.controls[name] = control;
};

/*
	Base GUI Controls
	These need to be registered first!
*/
var Panel = function() {

	this.id = 'undefined';

	this.remove = function() {
		var dom = $('#'+this.id);
		if(dom) { dom.remove(); }
		this.onRemove();
	};

	this.onRemove = function() {
		//delete this;
	};

};
Panel.prototype = new Panel();

CATAN.GUI.register('Panel', Panel);