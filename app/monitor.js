//Client-side monitor js application

var socket = io.connect('http://localhost:8080');
socket.on('stats',
	function(data)
	{
		console.log(data)
	});