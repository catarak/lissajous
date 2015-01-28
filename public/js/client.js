var socket = io();
var serverup = false;

function runIncomingCommand(command) {
	if(!serverup) return;
	console.log(command)
    try {
		eval.apply(window,[command]);
		source.value = '';
    } catch(e) {
        $("#terminal").terminal().echo(e.message);
        return;
    }
    $("#terminal").terminal().echo(command);
}

jQuery(document).ready(function($) {
	setInterval(serverReady, 1000);

    $('#terminal').terminal(function(command) {
    	if(!serverup) return;
        try {
            var result = eval.apply(window,[command]);
    		socket.emit('sendLine', command);

        } catch (e) {
            $("#terminal").terminal().set_command(command);
            return e.message;
        }
        return "[[guib;<COLOR>;<BACKGROUND>]" + command + "]";
    }, {
        greetings: "",
        prompt: "> "
    });

    socket.on('updateLine', runIncomingCommand);
});

function serverReady() {
	if (! socket.connected) console.error('U lost connection with the server');
	serverup = socket.connected;
}
