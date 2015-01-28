var socket = io();
var serverup = false;
var myColor = "0x00ff00"; // Fill this with whatever User ID-generated color

function colorify(message, color) {
    return "[[;" + color + ";]" + message + "]";
}

function runIncomingCommand(command, color) {
	if(!serverup) return;
    // Command: string with command to run
    // Color: string with the user color code
    try {
        var result = eval.apply(window,[command]);
    } catch(e) {
        var out = colorify(
            "Error in incoming command: " + command + "\n" +
            "    " + e.message,
        color);
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
            return colorify(e.message,myColor);
        }
        return colorify(command,myColor);
    }, {
        completion: [],
        greetings: "",
        prompt: "> "
    });

    socket.on('updateLine', runIncomingCommand);
});

function serverReady() {
	if (! socket.connected) console.error('U lost connection with the server');
	serverup = socket.connected;
}
