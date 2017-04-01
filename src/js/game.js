const PIXI = require('pixi.js');
const EventEmitter = require('events').EventEmitter;
var StageSet = require('./stageSet');

/**
 * This class represents the game as a whole. It is responsible for
 * the creation of the stage, setting up the game loop
 * and adding and removing players
 */
module.exports = class Game extends EventEmitter {

  /**
   * Creates the game
   *
   * @param   {DOMelement} element the container the game will live in
   *
   * @constructor
   */
  constructor(element) {

    // Initialise the EventEmitter
    super();


    // message for info on pixi.js
    var type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) {
      type = "canvas"
    }
    PIXI.utils.sayHello(type);

    //cache for the element we are binding the game on
    this._element = element;

    // Keep a reference to the spaceships we'll create
    this.spaceShips = [];

    // Pixi creates a nested Hierarchie of DisplayObjects and Containers. The stage is just the outermost container
    this.stage = new PIXI.Container();

    // We want a renderer with a transparent background - ideally a WebGL one
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth - 5, window.innerHeight - 5, {transparent: true}, false);

    // append the canvas created by the renderer to our DOM element
    this._element.appendChild(this.renderer.view);

    // Frames are distributed unevenly - let's keep track of how much time has passed since the last one
    this._lastFrameTime = 0;


    //draw the stage set
    var _this = this;
    var stageSet = new StageSet({
      equation: function (x) {
        return 50 * Math.sin(x / 50);
      },
      'renderer': _this.renderer
    });
    stageSet.draw(_this.stage, "0x009900", 1);

    // On the next frame, the show begins
    requestAnimationFrame(this._tick.bind(this));
  }


  /**
   * Adds a new spaceship at a random position to the stage
   *
   * @param {String} name the name of the player
   *
   * @private
   * @returns {void}
   */
  addPlayer(name) {
    var x = this.renderer.width * ( 0.1 + Math.random() * 0.8 );
    var y = this.renderer.height * ( 0.1 + Math.random() * 0.8 );
    this.spaceShips.push("new SpaceShip");
  }

  /**
   * Removes a spaceship from the stage, either as a result of it being
   * destroyed or because a player disconnected
   *
   * @param   {String} name the name of the player associated with this ship
   *
   * @private
   * @returns {void}
   */
  removePlayer(name) {
    for (var i = 0; i < this.spaceShips.length; i++) {
      if (this.spaceShips[i].name === name) {
        this.spaceShips[i].remove();
        this.spaceShips.splice(i, 1);
      }
    }
  }

  /**
   * Called on every frame. Notifies subscribers, updates
   * the time and renders the frame
   *
   * @param   {Number} currentTime Milliseconds since page was loaded
   *
   * @private
   * @returns {void}
   */
  _tick(currentTime) {
    // notify objects of the impeding update. This gives ships time to reposition
    // themselves, bullets to move etc.
    this.emit('update', currentTime - this._lastFrameTime, currentTime);

    // store the time
    this._lastFrameTime = currentTime;

    // render the next frame
    this.renderer.render(this.stage);

    // and schedule the next tick
    requestAnimationFrame(this._tick.bind(this));
  }
}