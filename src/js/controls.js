// http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/

var Key = {
  _pressed: {},

  LEFT: 37,
  LEFT2: 81,
  UP: 38,
  UP2: 90,
  RIGHT: 39,
  RIGHT2: 68,
  DOWN: 40,
  DOWN2: 83,
  SPACE: 32,
  ACCELERATE: 69,
  DECELERATE: 65,

  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    this._pressed[event.keyCode || event.which] = true;
  },

  onKeyup: function(event) {
    delete this._pressed[event.keyCode || event.which];
  }
};
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

module.exports = Key;