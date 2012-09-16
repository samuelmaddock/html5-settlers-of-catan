CATAN.GUI = (function(CATAN) {

	var module = {}

	/**
	 * Module Fields
	 */

	module.controls = [];

	/**
	 * Module Methods
	 */

	module.create = function(name) {
		var control = this.controls[name];
		if(control) {
			return new control();
		}
	};

	module.register = function(name,control) {
		this.controls[name] = control;
	};

	return module;

}(CATAN));


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