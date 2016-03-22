var os = require('os');
var cpu = require('windows-cpu');
var toGB = 1073741824

var SystemMonitor = function()
{
	this.uptime;
	this.checkUptime();
	this.memory = this._getMemoryInfo();
	this.cpu = this._getCpuInfo();
};

SystemMonitor.prototype._getCpuInfo = function()
{
	var os_cpu = os.cpus();
	var cpu = {}

	cpu.load;
	cpu.cores = os_cpu.length;
	cpu.speed = os_cpu.speed;
	cpu.model = os_cpu.model;

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
	this.hostname = os.hostname();
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
	this.uptime = this.adapt(hours) + ":" + this.adapt(minutes) + ":" + this.adapt(seconds); 
};

SystemMonitor.prototype.checkMemory = function()
{
	var memory = this.memory;
	memory.freemem = (os.freemem() / toGB).toFixed(1);
	memory.usedmem = (memory.totalmem - memory.freemem).toFixed(1);
	memory.percentage = Math.round((100/memory.totalmem) * memory.usedmem);
};

SystemMonitor.prototype.checkLoad = function()
{
	var that = this;
	cpu.totalLoad(
		function(error, results)
		{
			if(error)
				return console.log(error);
			that.cpu.load = results
	});
};

SystemMonitor.prototype.update = function(callback)
{
	this.checkLoad();
	this.checkUptime();
	this.checkMemory();
	callback(this);
};

SystemMonitor.prototype.display = function()
{
	this.clearScreen();
	console.log(this.hostname);
	console.log(this.uptime);
	console.log(this.memory.usedmem + "/" + this.memory.totalmem + " GB (" + this.memory.percentage + "%)");
	if (this.cpu.load)
		console.log(this.cpu.load[0] + " %")
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

var monitor = new SystemMonitor();
var loopID = setInterval(function(){monitor.update(
	function(monitor)
	{
		monitor.display();
	})}, 500);

