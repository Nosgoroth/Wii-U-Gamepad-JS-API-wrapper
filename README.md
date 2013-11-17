# Wii U Gamepad JS API wrapper

A JS wrapper for easy subscription to Wii U Gamepad button/stick input events. I built this to control a html5 video player with the gamepad buttons.

Note: NO, there is no way (that I'm aware of) to programatically prevent these inputs from trigerring their default browser actions . The best that can be done is keep the video playing on the gamepad so that some buttons trigger their video playback actions.

## Usage
1. This file instances WiiUGamePadController in window.wup
2. Whenever you're ready to start readaing inputs (on document ready) call .init()
	NOTE: You can change the polling interval from the default 20ms with .setPollingInterval(MILLISECONDS), before or after .init()
3. Check that the API is available with .isValid()
4. Subscribe to key events with .on(ID, CALLBACK). Callbacks will be fired once per press, regardless of how long the button is pressed
	NOTE: You can change the deadzone for stick inputs with .setDeadzone(FLOAT), where the float must be a number between 0 and 1
5. Unsubscribe with .off(ID) if necessary

## ID list

IDs are strings of one or two lowercase letters indicating an input

* D-pad: du dd dl dr
* Left stick: lu ld ll lr
* Right stick: ru rd rl rr
* Triggers: l r zl zr
* Face buttons: a b x y
	
## Example

```JavaScript
//jQuery is not required
jQuery(document).ready(function(){
	window.wup.init();
	window.wup.on('lu', function() {
		alert("Left stick has been pushed up! (And beyond the threshold of 0.5)");
	});
	window.wup.on('zl', function() {
		alert("ZL has been pressed!");
	});
});
```