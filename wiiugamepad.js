/*
	Wrapper for Wii U Gamepad Controller API.
	Usage:
		1) This file instances WiiUGamePadController in window.wup
		2) Whenever you're ready to start readaing inputs (on document ready) call .init()
			NOTE: You can change the polling interval from the default 20ms with .setPollingInterval(MILLISECONDS), before or after .init()
		3) Check that the API is available with .isValid()
		4) Subscribe to key events with .on(ID, CALLBACK). Callbacks will be fired once per press, regardless of how long the button is pressed
			NOTE: You can change the deadzone for stick inputs with .setDeadzone(FLOAT), where the float must be a number between 0 and 1
		5) Unsubscribe with .off(ID) if necessary
	
	ID list:
		(IDs are strings of one or two lowercase letters indicating an input
		D-pad: du dd dl dr
		Left stick: lu ld ll lr
		Right stick: ru rd rl rr
		Triggers: l r zl zr
		Face buttons: a b x y
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

