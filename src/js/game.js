const PIXI = require('pixi.js');
const EventEmitter = require('events').EventEmitter;
const BackGround = require('./background');
const Ship = require('./ship');
const BulletManager = require('./bullet-manager');
const EnemyManager = require('./enemy-manager');
const ExplosionManager = require('./explosion-manager');
const Bump = require('./collision');
const bump = new Bump();

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
    this._element.innerHTML = "";
    this._element.appendChild(this.renderer.view);

    // Frames are distributed unevenly - let's keep track of how much time has passed since the last one
    this._lastFrameTime = 0;

    //cache game var for use inside sub-objects
    var _this = this;

    //set a world width to go around it
    this.worldSizeFactor = 10;
    this.worldWidth = this.renderer.width * this.worldSizeFactor;

    //Add the background
    this.stage.background = new BackGround({
      parent: _this
    });

    this.enemyManager = new EnemyManager({
      parent: _this,
      initialEnemies: this.worldSizeFactor * 5
    });

    this.ship = new Ship({
      parent: _this,
      color: false //"0xff0000"
    });

    this.spaceShips = [];
    this.spaceShips.push(this.ship);

    this.bulletManager = new BulletManager({
      parent: _this,
      initialBullets: 10
    });
    this.explosionManager = new ExplosionManager({
      parent: _this
    });
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
    this.emit('update', currentTime - this._lastFrameTime, currentTime);

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

  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  getScreenXof(el, dt, t) {
    let sprite = (el instanceof PIXI.Sprite) ? el : el.sprite;
    if (this.ship instanceof Ship && sprite instanceof PIXI.Sprite &&
      (typeof el.depth === 'number') && (typeof sprite.position.x === 'number')) {
      if(el.worldX){
        return this.mod(el.worldX - this.ship.worldX + el.depth * this.renderer.width/2 + sprite.width,this.worldWidth) - sprite.width;
      }
    }
    return -50;
  }

  checkHit(hitbox1, sprite) {
    let touched = false;
    if (sprite instanceof PIXI.Sprite) {
      if (hitbox1 instanceof PIXI.Graphics) {
        touched = false;
      } else if (hitbox1.rectangle instanceof PIXI.Rectangle) {
        touched = bump.hitTestRectangle(hitbox1.rectangle, sprite);
      } else if (hitbox1.sprite instanceof PIXI.Sprite) {
        touched = bump.rectangleCollision(sprite, hitbox1.sprite);
      } else if (hitbox1.position instanceof PIXI.Point || hitbox1.position instanceof PIXI.ObservablePoint) {
        touched = sprite.containsPoint(hitbox1.position);
      }
    }
    return touched;
  }

  resize(event) {
    let size = [1920, 1080];
    let ratio = size[0] / size[1];
    let w = 0;
    let h = 0;
    if (window.innerWidth / window.innerHeight >= ratio) {
      w = window.innerHeight * ratio;
      h = window.innerHeight;
    } else {
      w = window.innerWidth;
      h = window.innerWidth / ratio;
    }
    this.renderer.view.style.width = w + 'px';
    this.renderer.view.style.height = h + 'px';
  }
}