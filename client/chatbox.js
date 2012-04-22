Chatbox = function() {

	this.enabled = false;
	this.log = []
	this.fadeTimeout = 15 * 1000; // time in milliseconds

};

Chatbox.prototype = new Chatbox();

Chatbox.prototype.Setup = function() {

	console.log("SETTING UP CHATBOX")

	$('#chatbox').html('<div id="log">' +
		'	<table id="chat">' +
		'		<tbody>' +
		'		</tbody>' +
		'	</table>' +
		'</div>' +
		'' +
		'<div id="input">' +
		'	<input type="text" id="entry" maxlength="128" spellcheck="false" />' +
		'</div>' +
	'</div>')

	var cb = this;

	// Send text upon pressing 'Enter'
	$('#entry').keypress(function(event) {
		if(event.which == 13) {
			cb.Send()
		}
	});

};

Chatbox.prototype.Toggle = function() {

	if(this.enabled) {
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

Chatbox.prototype.Send = function() {

	var entry = $('#entry');

	if(entry.val() == "") return;

	socket.emit('chatSend', {
		text: entry.val()
	});

	entry.val('')

};

Chatbox.prototype.AddLine = function(data, type) {

	var id, text;

	if(type == "player") { // message sent by player

		id = "cl_" + (this.log.length + 1);
		text = this.Cleanse(data.Text);

		var name = this.Cleanse(data.Name),
		col = data.Color;

		$('#log').append('<table id="' + id + '" class="chatline"><tr><td class="name" style="color: #' + col + ';">' + name + '</td><td>' + text + '</td></tr></table>');
		
		this.log.push({ Name: name, Text: text })

	} else { // message sent from server

		id = "cl_" + (this.log.length + 1);
		text = this.Cleanse(data);

		$('#log').append('<table id="' + id + '" class="chatline note"><tr><td>' + text + '</td></tr></table>');

		this.log.push({ Text: text })

	}

	// fade out messages
	setTimeout(function() {
		$('#' + id).fadeOut();
	}, this.fadeTimeout );

	// Send scrollbar to the bottom
	var log = document.getElementById("log")
	log.scrollTop = log.scrollHeight

};