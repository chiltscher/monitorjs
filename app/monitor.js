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
	var pb = this.cpuStat;
	var load = data.cpu.load[0];
	pb.text(load + " %")
	pb.width(load + "%")
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