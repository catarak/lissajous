var socket = io();
var serverup = false;
var mystackindex = -1;
var colors = palette('sequential', 100);
var myColor = "0x00ff00"; // Fill this with whatever User ID-generated color

function colorify(message, color) {
    var m = "[[;#" + colors[color] + ";#000]" + message + "]";
    console.log(m);
    return m;
}

function runIncomingCommand(command) {
	if (!serverup) return;
    // Command: string with command to run
    // Color: string with the user color code
    for (var i=0;i<command.length;i++) {
        if (command[i].index < mystackindex) {
            var com = command[i].text;
            try {
                eval.apply(window,[com]);
            } catch(e) {
                var out = colorify(
                    "Error in incoming command: " + com + "\n" +
                    "    " + e.message,
                command[i].color);
                $("#terminal").terminal().echo(out);
            } finally {
                mystackindex = commmand[i].index;
            }
            $("#terminal").terminal().echo(colorify(com, command[i].color));
        }
    }
}

jQuery(document).ready(function($) {
	setInterval(serverReady, 1000);

    $('#terminal').terminal(function(command) {
        if(!serverup) {
            return $("#terminal").terminal().error("Server offline.");
        }
        socket.emit('sendLine', command);
        try {
            eval.apply(window, [command]);
        } catch (e) {
            $("#terminal").terminal().set_command(command);
            return colorify(e.message, myColor);
        }
        return colorify(command, myColor);
    }, {
        completion: [],
        greetings: "",
        prompt: "> "
    });

    socket.on('handshake', function(color) {
        console.log('you are player ' + color);
        myColor = color;
    });
    socket.on('updateLine', runIncomingCommand);
});

function serverReady() {
	if (! socket.connected) console.error('U lost connection with the server');
	serverup = socket.connected;
}
