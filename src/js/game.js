const PIXI = require('pixi.js');
const EventEmitter = require('events').EventEmitter;
const StageSet = require('./stageSet');

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

    // Keep a reference to the stage sets we'll create
    this.stageSets = [];

    // Pixi creates a nested Hierarchie of DisplayObjects and Containers. The stage is just the outermost container
    this.stage = new PIXI.Container();

    // We want a renderer with a transparent background - ideally a WebGL one
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent: true}, false);

    // append the canvas created by the renderer to our DOM element
    this._element.appendChild(this.renderer.view);

    // Frames are distributed unevenly - let's keep track of how much time has passed since the last one
    this._lastFrameTime = 0;


    //draw the stage set
    var _this = this;
    this.stageSets.push(new StageSet({
      equation: function (x) {
        return 50 * Math.sin(x / 50) + Math.cos(x /100);
      },
      stage: _this.stage,
      renderer: _this.renderer,
      color: "0x006600"
    }));

    this.stageSets.push(new StageSet({
      equation: function (x) {
        return 25 * Math.cos(x /100) + 50 * Math.sin(x / 5000);
      },
      stage: _this.stage,
      renderer: _this.renderer,
      color: "0x009900",
      yOffset: Math.round(_this.renderer.height / 2 + 100)
    }));

    // On the next frame, the show begins
    requestAnimationFrame(this._tick.bind(this));
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

    for (var i = 0; i < this.stageSets.length; i++) {
      this.stageSets[i].xOffset += 0.5 * (i + 1) * Math.PI;
      this.stageSets[i].draw();
    }
    //console.log(this._lastFrameTime);

    // render the next frame
    this.renderer.render(this.stage);

    // and schedule the next tick
    requestAnimationFrame(this._tick.bind(this));
  }
}