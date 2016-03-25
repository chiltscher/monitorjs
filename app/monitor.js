//Client-side monitor js application



monitorClient = function()
{
	this.hostnameDiv = $('#hostname');
	this.osDiv = $('#os');
	this.cpuModelDiv = $('#cpuModel');
	this.cpuSpeedDiv = $('#cpuSpeed');
	this.cpuLoadDiv = $('#cpuLoad');
	this.memoryDiv = $('#memory');

	this.cpuStat = $('#cpu');
	this.mem = $('#mem');

	this.socket = io.connect('/sysMon');
	this._socketHandler();
}

monitorClient.prototype._update = function(data)
{
	this.hostnameDiv.text("Hostname : " + data.hostname);
	this.osDiv.text("Operating System : " + data.platform);
	this.cpuModelDiv.text("CPU Model : " + data.cpu.model);
	this.cpuSpeedDiv.text("CPU Speed : " + data.cpu.cores + " x " + data.cpu.speed + " MHz");
	if(data.cpu.load[0])
		this.cpuLoadDiv.text("CPU Load : " + data.cpu.load[0] + " %");
	this.memoryDiv.text("Memory : " + data.memory.usedmem + "/" + data.memory.totalmem + " GB (" + data.memory.percentage + "%)")


	//update progressbar
	var pb1 = this.cpuStat;
	var load = data.cpu.load[0];
	pb1.text(load + " %");
	pb1.width(load + "%");

	var pb2 = this.mem;
	var load = data.memory.percentage;
	pb2.text(data.memory.percentage + " %");
	pb2.width(data.memory.percentage + "%");
}

monitorClient.prototype._socketHandler = function()
{
	var that = this;
	this.socket.on('stats',
		function(data)
		{
			that._update(data)
		});
}

$(document).ready(
	function()
	{
		var client = new monitorClient();
	});