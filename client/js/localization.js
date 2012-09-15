String.prototype.format = function() {
	var formatted = this;
	for(arg in arguments[0]) {
		formatted = formatted.replace("{" + arg + "}", arguments[0][arg]);
	}
	return formatted;
};

CATAN.Localization = (function(CATAN) {

	var module = {}

	/**
	 * Module Fields
	 */

	module.languages = [];
	module.char = "#";

	/**
	 * Module Methods
	 */

	module.register = function(name,translations) {
		this.languages[name] = translations;
	}

	module.getLanguage = function() {
		return (localStorage && localStorage.language) ? localStorage.language : "english";
	};

	module.translate = function() {
		var self = module;
		var str = arguments[0];

		if(str.indexOf(self.char) != 0) return str;

		var translations = self.languages[self.getLanguage()];
		var newstr = (translations && translations[str.slice(1)]) ? translations[str.slice(1)] : str;

		if(arguments.length > 1) {
			var args = Array.prototype.slice.call(arguments, 1);
			newstr = newstr.format(args);
		}

		return newstr;
	};

	return module;

}(CATAN));

T = CATAN.Localization.translate;