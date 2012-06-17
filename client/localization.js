/* Localization Module */
CATAN.Localization = {}
CATAN.Localization.char = "#";
CATAN.Localization.languages = [];

CATAN.Localization.register = function(name,translations) {
	this.languages[name] = translations;
};

CATAN.Localization.getLanguage = function() {
	return (localStorage && localStorage.language) ? localStorage.language : "english";
};

CATAN.Localization.translate = function() {

	var str = arguments[0];

	var self = CATAN.Localization;
	if(str.indexOf(self.char) != 0) return str;

	var translations = self.languages[self.getLanguage()];
	var newstr = (translations && translations[str.slice(1)]) ? translations[str.slice(1)] : str;

	if(arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		newstr = newstr.format(args);
	}

	return newstr;

};

String.prototype.format = function() {
	var formatted = this;
	for(arg in arguments[0]) {
		formatted = formatted.replace("{" + arg + "}", arguments[0][arg]);
	}
	return formatted;
};

T = CATAN.Localization.translate;