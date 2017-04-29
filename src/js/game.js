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

    // Pixi creates a nested hierarchy of DisplayObjects and Containers. The stage is just the outermost container
    this.stage = new PIXI.Container();

    // We want a renderer with a transparent background - ideally a WebGL one
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent: true}, false);

    // append the canvas created by the renderer to our DOM element
    this._element.appendChild(this.renderer.view);

    // Frames are distributed unevenly - let's keep track of how much time has passed since the last one
    this._lastFrameTime = 0;

    //cache game var for use inside sub-objects
    var _this = this;

    //set a world width to go around it
    this.worldWidth = this.renderer.width * 10;

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
    // notify objects of the impeding update.
    this.emit( 'update', currentTime - this._lastFrameTime, currentTime );

    // store the time
    this._lastFrameTime = currentTime;

    // render the next frame
    this.renderer.render(this.stage);

    // and schedule the next tick
    requestAnimationFrame(this._tick.bind(this));
  }

  //modulo always positive
  mod(a, b) {
    var ret = a % b;
    if (ret < 0) {
      ret += b;
    }
    return ret;
  }
  getScreenXof(el){
    let sprite = (el instanceof PIXI.Sprite) ? el : el.sprite ;
    if(this.ship instanceof Ship && sprite instanceof PIXI.Sprite && el.depth && el.worldX) {
      //World is round sprite can be be nearer left or right
      //take width of sprite as margin to not make it disappear once it touch a border of the screen
      return this.mod(el.worldX - el.depth * this.ship.worldX + sprite.width + this.ship.xOffset, this.worldWidth) - sprite.width ;
    }
    return -50;
  }
  getScreenWorldRange(){
    let ship = this.ship;
    if(ship instanceof Ship){
      let x1 = this.mod(ship.worldX - ship._ship.position.x,this.worldWidth);
      let x2 = this.mod(ship.worldX - ship._ship.position.x + this.renderer.width,this.worldWidth);
      let xMin = Math.min(x1,x2);
      let xMax = Math.max(x1,x2);
      x1 = (xMin === 0) ? xMax : xMin;
      x2 = (xMin === 0) ? this.worldWidth : xMax;
      let x3 = (xMin === 0) ? 0 : 0;
      let x4 = (xMin === 0) ? xMin : 0;
      return  {
        min:  x1,
        max:  x2,
        min2: x3,
        max2: x4
      }
    }
    return undefined;
  }
}