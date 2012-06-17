var Chatbox = function() {

	this.id = 'chatbox';

	this.enabled = false;
	this.log = []
	this.fadeTimeout = 15 * 1000; // time in milliseconds

	$('#game').append($('<div>').attr('id', 'chatbox')
		.html('<div id="log">' +
			'</div>' +
			'' +
			'<div id="input">' +
			'	<input type="text" id="entry" maxlength="128" spellcheck="false" />' +
			'</div>' +
		'</div>')
	);

};

Chatbox.prototype = CATAN.GUI.create('Panel');

Chatbox.prototype.Toggle = function() {

	if(this.enabled) {
		this.Send();
		$('#chatbox').css('background-color', 'rgba(0,0,0,0)');
		$('#log').css('overflow-y', 'hidden');
		$('#input').hide();
		this.enabled = false;
	} else {
		$('#chatbox').css('background-color', 'rgba(0,0,0,0.3)');
		$('#log').css('overflow-y', 'auto');
		$('#input').show();
		$('#entry').focus();
		this.enabled = true;
	}

}

Chatbox.prototype.Cleanse = function(text) {
	return $('<div/>').text(text).html();
}

Chatbox.prototype.Hex2String = function(color) {
	var x=color.toString(16);
	var y=(6-x.length);
	var z="000000";
	var z1 = z.substring(0,y);
	return "#" + z1 + x;
}

Chatbox.prototype.Send = function() {

	var entry = $('#entry');

	if(entry.val() == "") return;

	CATAN.server.emit('playerChat', {
		text: entry.val()
	});

	entry.val('')

};

Chatbox.prototype.AddLine = function(data, type) {

	var id, text;

	if(type == "player") { // message sent by player

		id = "cl_" + (this.log.length + 1);
		text = this.Cleanse(data.Text);

		var col = this.Hex2String(data.ply.getColor());

		$('#log').append('<table id="' + id + '" class="chatline"><tr><td class="name" style="color: ' + col + ';">' + data.ply.getName() + '</td><td>' + text + '</td></tr></table>');
		
		this.log.push({ Name: data.ply.getName(), Text: text })

	} else { // message sent from server

		id = "cl_" + (this.log.length + 1);
		text = this.Cleanse(data);

		//$('#log').append('<table id="' + id + '" class="chatline note"><tr><td>' + text + '</td></tr></table>');
		CATAN.Notify({subtitle:text});

		this.log.push({ Text: text });

	}

	// fade out messages
	setTimeout(function() {
		$('#' + id).fadeOut();
	}, this.fadeTimeout );

	// Send scrollbar to the bottom
	var log = document.getElementById("log");
	log.scrollTop = log.scrollHeight;

};

CATAN.GUI.register( "Chatbox", Chatbox );