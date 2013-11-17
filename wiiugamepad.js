/*
	Wrapper for Wii U Gamepad Controller API.
	https://github.com/Nosgoroth/Wii-U-Gamepad-JS-API-wrapper/
*/


function WiiUGamePadController() {
	this.valid = false;
	
	this.pollInterval = 20; //ms
	this._interval = null;
	this.deadzone = 0.5;
	
	this.keybits = {
		"a":	0x00008000,
		"b":	0x00004000,
		"x":	0x00002000,
		"y":	0x00001000,
		"l":	0x00000020,
		"r":	0x00000010,
		"zl":	0x00000080,
		"zr":	0x00000040,
		"du":	0x00000200,
		"dd":	0x00000100,
		"dl":	0x00000800,
		"dr":	0x00000400
	};
	
	this.bouncectrl = {};
	
	this.callbacks = {};
}

WiiUGamePadController.prototype.isValid = function(f) {
	return this.valid;
}
WiiUGamePadController.prototype.setDeadzone = function(f) {
	this.deadzone = f;
}
WiiUGamePadController.prototype.setPollingInterval = function(f) {
	if (this._interval && !f) { return; }
	if (this._interval) { clearInterval(this._interval); }
	if (f) { this.pollInterval = f; }
	var that = this;
	this._interval = setInterval(function(){ that.update(); }, this.pollInterval);
	
}
WiiUGamePadController.prototype.init = function() {
	if (typeof(window.wiiu)=="undefined") { return; }
	if (typeof(window.wiiu.gamepad)=="undefined") { return; }
	
	this.valid = true;
	
	this.setPollingInterval();
}
WiiUGamePadController.prototype.update = function() {
	if (!this.valid) { return; }
	window.wiiu.gamepad.update();
	if (!window.wiiu.gamepad.isEnabled || !window.wiiu.gamepad.isDataValid) {
		return;
	}
	
	this.updateButton( "lu", window.wiiu.gamepad.lStickY >  this.deadzone );
	this.updateButton( "ld", window.wiiu.gamepad.lStickY < -this.deadzone );
	this.updateButton( "ll", window.wiiu.gamepad.lStickX < -this.deadzone );
	this.updateButton( "lr", window.wiiu.gamepad.lStickX >  this.deadzone );
	
	this.updateButton( "ru", window.wiiu.gamepad.rStickY >  this.deadzone );
	this.updateButton( "rd", window.wiiu.gamepad.rStickY < -this.deadzone );
	this.updateButton( "rl", window.wiiu.gamepad.rStickX < -this.deadzone );
	this.updateButton( "rr", window.wiiu.gamepad.rStickX >  this.deadzone );
	
	for (var name in this.keybits) {
		if (this.keybits.hasOwnProperty(name)) {
			this.updateButton( name, this.bittest(window.wiiu.gamepad.hold, this.keybits[name]) );
		}
	}
	
}
WiiUGamePadController.prototype.updateButton = function(name, isPressed) {
	if (typeof(this.bouncectrl)=="undefined") { this.bouncectrl = {}; }
	if (typeof(this.bouncectrl[name])=="undefined") { this.bouncectrl[name] = false; }
	if (!this.bouncectrl[name] && isPressed) {
		this.attemptTrigger(name);
	}
	this.bouncectrl[name] = isPressed;
}
WiiUGamePadController.prototype.attemptTrigger = function(name) {
	if (this.callbacks[name] && typeof(this.callbacks[name])=="function" ) {
		this.callbacks[name]();
	}
}
WiiUGamePadController.prototype.on = function(name, callback) {
	this.callbacks[name] = callback;
}
WiiUGamePadController.prototype.off = function(name) {
	this.callbacks[name] = null;
}
WiiUGamePadController.prototype.bittest = function(num,bit){ 
	return (num & 0x7f86fffc & bit);
}




window.wup = new WiiUGamePadController();

