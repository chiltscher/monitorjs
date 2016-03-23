
//Serverside App
var express = require('express');
var app = express();
var http = require('http');
var os = require('os');
var cpu = require('windows-cpu');
var io = require('socket.io');
var config = require('./configuration.json');

var toGB = 1073741824

var SystemMonitor = function()
{
	this.data = {};
	this.data.hostname = os.hostname();
	this.data.platform = this._getPlatform();
	this.data.loopID;
	this.data.uptime;
	this.checkUptime();
	this.data.memory = this._getMemoryInfo();
	this.data.cpu = this._getCpuInfo();

};
SystemMonitor.prototype._getPlatform = function()
{
	var platform = os.platform()
	switch(platform)
	{
		case 'win32':
			platform = 'Windows';
			break;
		case 'linux':
			platform = 'Linux';
			break;
		case 'sunos':
			platform = 'SunOS'
			break;
		default:
			platform = 'Unknow Operating System'
	}
	return platform
}

SystemMonitor.prototype._getCpuInfo = function()
{
	var os_cpu = os.cpus();
	var cpu = {}

	cpu.load;
	cpu.cores = os_cpu.length;
	cpu.speed = os_cpu[0].speed;
	cpu.model = os_cpu[0].model;

	return cpu;
};

SystemMonitor.prototype._getMemoryInfo = function()
 {
 	var memory = {};

	memory.totalmem = (os.totalmem() / toGB).toFixed(1);	
	memory.freemem;
	memory.usedmem;
	memory.percentage;

	return memory;
 };

SystemMonitor.prototype._getNetworkInformation = function()
{
	var os_nwif = os.networkInterfaces();
	var nwif = {};
	if (os_nwif['WLAN'])
	{
		nwif.type = 'WLAN'
		os_nwif = os_nwif['WLAN']
	}
	if (os_nwif['Ethernet'])
	{
		nwif.type = 'Ethernet'
		os_nwif = os_nwif['Ethernet']
	}
};

SystemMonitor.prototype.checkUptime = function()
{
	var seconds = os.uptime();
	var hours = Math.floor(seconds/3600);
	var minutes = Math.floor((seconds - hours * 3600) / 60 );
	seconds = Math.floor(seconds - hours * 3600 - minutes * 60);
	this.data.uptime = this.adapt(hours) + ":" + this.adapt(minutes) + ":" + this.adapt(seconds); 
};

SystemMonitor.prototype.checkMemory = function()
{
	var memory = this.data.memory;
	memory.freemem = (os.freemem() / toGB).toFixed(1);
	memory.usedmem = (memory.totalmem - memory.freemem).toFixed(1);
	memory.percentage = Math.round((100/memory.totalmem) * memory.usedmem);
};

SystemMonitor.prototype.checkLoad = function()
{
	var that = this;
	if (this.data.platform == 'Windows')
	{
		cpu.totalLoad(
			function(error, results)
			{
				if(error)
					return console.log(error);
				that.data.cpu.load = results
		});
	}
	else
		this.data.cpu.load = 'unknown'
};

SystemMonitor.prototype.update = function(callback)
{
	this.checkLoad();
	this.checkUptime();
	this.checkMemory();
	if(callback)
		callback(this);
};

SystemMonitor.prototype.display = function()
{
	this.clearScreen();
	console.log(this.data.hostname);
	console.log(this.data.uptime);
	console.log(this.data.memory.usedmem + "/" + this.data.memory.totalmem + " GB (" + this.data.memory.percentage + "%)");
	if (this.cpu.load)
		console.log(this.data.cpu.load[0] + " %")
};

// Clear Console function
SystemMonitor.prototype.clearScreen = function()
{
	for(var i = 0; i < process.stdout.rows; i++)
	{
		console.log('\r\n');
	}
};

// Function to set a 0 in front of a one-digit number
SystemMonitor.prototype.adapt = function(number)
{
	if (number < 10)
		return "0"+number
	else
		return number+""
};

MonitorServer = function(monitor)
{
	this.monitor = monitor;
	this.sockets = []; 
	this.httpServer = http.createServer(app);
	this.httpServer.listen(8889, 'master');
	this.io = io.listen(this.httpServer)
	if (config.standalone)
	{
		this._standaloneServer();
		this._socketHandler();
	}
}
MonitorServer.prototype._socketHandler = function()
{
	var that = this;
	var io = this.io;

	io.sockets.on('connection', 
		function(socket)
		{
			console.log("Client connected!")
			that.sockets.push(socket);
			that._startEvents(socket)
		});

};

MonitorServer.prototype._startEvents = function(socket)
{
	var that = this;
	var data = this.monitor.data

	var callbackID = setInterval(function()
	{
		socket.emit('stats', data);
	}, 500);

	socket.on('disconnect',
		function(socket)
		{
			console.log("Client disconnected!");
			that._removeSocketFromList();
		});

}

MonitorServer.prototype._removeSocketFromList = function()
{
	var sockets = this.sockets;
	for(socket in sockets)
	{
		var currentSocket = sockets[socket];
		if(currentSocket.disconnected)
		{
			var index = sockets.indexOf(currentSocket);
			if(index > -1)
				sockets.splice(index, 1);
		}
	}
	console.log('Socket successfully removed!')
};

MonitorServer.prototype._standaloneServer = function()
{
	var that = this;
	app.use(express.static('./app'))
	app.get('/',
		function(request, response)
		{
			response.sendfile('./app/monitor.html')
		});
};


var monitor = new SystemMonitor();
monitor.loopID = setInterval(
					function()
					{
						monitor.update()
					}, 500);
var server = new MonitorServer(monitor);




