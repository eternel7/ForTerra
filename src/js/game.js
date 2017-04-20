const PIXI = require('pixi.js');
const EventEmitter = require('events').EventEmitter;
const StageSet = require('./stageSet');
const BackGround = require('./background');
const Ship = require('./ship');
const BulletManager = require('./bullet-manager');

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

    // Keep a reference to the components we will update on each frame
    this.components = [];

    // Pixi creates a nested Hierarchie of DisplayObjects and Containers. The stage is just the outermost container
    this.stage = new PIXI.Container();

    // We want a renderer with a transparent background - ideally a WebGL one
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent: true}, false);

    // append the canvas created by the renderer to our DOM element
    this._element.appendChild(this.renderer.view);

    // Frames are distributed unevenly - let's keep track of how much time has passed since the last one
    this._lastFrameTime = 0;

    //cache game var for use inside sub-objects
    var _this = this;

    //Add the background
    this.stage.background = new BackGround({
      parent: _this
    });

    // Keep reference to ship first because all is based on its movements
    this.ship = new Ship({
      parent: _this,
      color: false //"0xff0000"
    });
    this.bulletManager = new BulletManager({
      parent: _this,
      initialBullets: 10
    });
    this.spaceShips=[];
    this.spaceShips.push(this.ship);
    /*
    this.components.push(this.stage.background);
    */
/*
    //add the stage sets
    this.components.push(new StageSet({
      equation: function (x) {
        return 30 * Math.sin(x / 50) + Math.cos(x / 100);
      },
      parent: _this,
      depth: 0.3,
      color: "0x002200"
    }));
    this.ground = new StageSet({
      equation: function (x) {
        return 25 * Math.cos(x / 100) + 50 * Math.sin(x / 5000);
      },
      parent: _this,
      depth: 1,
      color: "0x003300",
      yOffset: Math.round(_this.renderer.height / 2 + 100)
    });
    this.components.push(this.ground);
*/
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
/*
    // update game background components
    for (var i = 0; i < this.components.length; i++) {
      this.components[i].update(currentTime - this._lastFrameTime, currentTime);
    }
*/
    // notify objects of the impeding update.
    this.emit( 'update', currentTime - this._lastFrameTime, currentTime );

    //console.log(this._lastFrameTime);

    // store the time
    this._lastFrameTime = currentTime;

    // render the next frame
    this.renderer.render(this.stage);

    // and schedule the next tick
    requestAnimationFrame(this._tick.bind(this));
  }
}