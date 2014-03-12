console.log(':begin' + ' ==============================' + process.env.PORT);
/*  ================================================================================
 Build Dependencies
 ================================================================================  */
console.log(':build dependencies' + ' ==============================');
var express = require('express'),
	http = require('http'),
	fs = require('fs'),
	//socketIO = require('socket.io'),
	path = require('path');

/*  ================================================================================
 Create Application
 ================================================================================  */
console.log('PhotoMaker:create application' + ' ==============================');
var app = express();

/*  ================================================================================
 Configure Application
 ================================================================================  */
console.log('PhotoMaker:configure application' + ' ==============================');
app.configure(function(){
	app.set('port', process.env.PORT || 8888);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

/*  ================================================================================
 EVENT FUNCTIONS
 ================================================================================  */
function broadcastEvent(event, broadcastData) {
	console.log("Broadcast:" + broadcastData);
	var d = new Date(),
		responseBody = '' + 'id: ' + d.getTime() + '\n' + 'event: ' + event + '\n' + 'data:' + broadcastData +   '\n\n';

	openEventConnections.forEach(function(resp) {
		resp.write(responseBody);
	});
}

function buildImage(req, res){
	console.log('handleBroadcastRequest: ' + req.originalUrl);
	var overlayData = req.body;

	if((overlayData != 'undefined')) {
		fs.writeFile('media/generated/' + new Date().getTime() + '.png', overlayData, function (err) {
			if(err) {
				console.log('NNOOOOOOOOOOOO');
				return;
			}
		});
		res.send('OK', 200); // ### respond 200 ok
	}
	else { // ### respond with broadcast form
		res.sendfile('./public/index.html');
	}
}

/*  ================================================================================
 DEFINE ROUTES
 ================================================================================  */
console.log('PhotoMaker:define routes' + ' ==============================');
//app.get('/broadcast/:event', handleBroadcastRequest);
//app.get('/broadcast/:event/', handleBroadcastRequest);
//app.get('/broadcast/:event/:id', handleBroadcastRequest);
//app.post('/broadcast/:event/', handleBroadcastRequest);
//app.post('/broadcast/:event', handleBroadcastRequest);
app.post('/create', buildImage);
//app.get('/events', handleEventListenRequest);

/*  ================================================================================
 Event Listener
 ================================================================================  */
var openEventConnections = [];
function handleEventListenRequest(req, res) {
	// set timeout as high as possible
	req.socket.setTimeout(Infinity);

	// send headers for event-stream connection
	// see spec for more information
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.write('\n');

	// push this res object to our global variable
	openEventConnections.push(res);

	// When the request is closed, e.g. the browser window
	// is closed. We search through the open connections
	// array and remove this connection.
	req.on("close", function() {
		var toRemove;
		for (var j =0 ; j < openEventConnections.length ; j++) {
			if (openEventConnections[j] == res) {
				toRemove =j;
				break;
			}
		}
		openEventConnections.splice(j,1);
	});
}

/*  ================================================================================
 START APPLICATIONS
 ================================================================================  */
console.log('PhotoMaker:start application' + ' ==============================');
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
/*

io = socketIO.listen(server);

*/
/*  ================================================================================
 SOCKETS
 ================================================================================  *//*

console.log(':create socket objects' + '==============================');
var socketGlobalLastBroadcast = false,
	socketGlobal = io.of('/').on(
		'connection',
		function (socket) {
			if(!!socketColorLastBroadcast) socket.emit('broadcast', socketGlobalLastBroadcast);
			socket.on('broadcast', function (data) {
				console.log('socketGlobal:broadcast: ' + data);
				socketGlobalLastBroadcast = data;
				socket.emit('broadcast', data);
			});
		});

var socketColorLastBroadcast = false,
	socketColor = io.of('/color').on(
		'connection',
		function (socket) {
			if(!!socketColorLastBroadcast) socket.emit('broadcast', socketColorLastBroadcast);
			socket.on('broadcast', function (data) {
				//console.log('socketColor:broadcast: ' + data);
				socketColorLastBroadcast = data;
				socket.emit('broadcast', data);
				socket.broadcast.emit('broadcast', data);
			});
		});

var socketURLLastBroadcast = false,
	socketURL = io.of('/url').on(
		'connection',
		function (socket) {
			if(!!socketURLLastBroadcast) socket.emit('broadcast', socketURLLastBroadcast);
			socket.on('broadcast', function (data) {
				//console.log('socketColor:broadcast: ' + data);
				socketURLLastBroadcast = data;
				socket.emit('broadcast', data);
				socket.broadcast.emit('broadcast', data);
			});
		});

*/

console.log('PhotoMaker:end of file' + ' ==============================');