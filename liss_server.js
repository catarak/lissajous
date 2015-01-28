/***********************
*   Lissajous Server   *
***********************/

var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

var stack = new Array();
var stackindex = 0;
var usernames = new Array();
var userindex = 0;

io.on('connection', function(socket){

	var name = "user"+userindex;
	socket.username = name;
	usernames[name] = name;
	socket.index = userindex;
	userindex++;

	socket.emit('handshake',socket.index);
	io.sockets.emit('updateusers', usernames);
  	console.log('a user connected');

	socket.on('disconnect', function(){
	  	console.log('user disconnected');
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
	});

	socket.on('sendLine', function (code) {
	
		stack.push({
			"index": stackindex,
			"text": code,
			"color": socket.index
		})

		stackindex++;

		if (stack.length>=10) {
			stack = stack.splice(stack.length-10,stack.length);
		}

		/* return update chat */
		io.sockets.emit('updateLine', stack);

	});

});

http.listen(8080, function(){
    console.log('listening on *:8080');
});