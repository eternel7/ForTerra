//TODO : look at http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
//The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

//The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

//Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

//track keyboard actions
module.exports = class Controls {
  constructor(config) {

    var _this = config.parent;

    //Capture the keyboard arrow keys
    var left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);

//Left arrow key `press` method
    left.press = function () {
      //Change the ship's velocity when the key is pressed
      _this.ship.accelerateX(false);
    };

    //Right arrow key `press` method
    right.press = function() {
      //Change the ship's velocity when the key is pressed
      _this.ship.accelerateX(true);
    };

    //Up
    up.press = function () {
      //Change the ship's velocity when the key is pressed
      _this.ship.accelerateY(false);
    };

    //Down
    down.press = function () {
      //Change the ship's velocity when the key is pressed
      _this.ship.accelerateY(true);
    };
  }
}