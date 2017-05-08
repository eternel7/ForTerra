const PIXI = require('pixi.js');

module.exports = class Movingsprite {
  constructor(config){
    this._game = config.game;
    this.sprite = undefined;
    this.vx = 1/50;
    this.vy = 0;
    this.depth = 1;
    this.worldX = 0;
    this.worldY = 0;
  }
  setSprite(sprite){
    this.sprite = sprite;
  }
  move(el,dt,t){
    this.sprite.position.x += dt * this.vx;
    this.sprite.position.y += dt * this.vy;
  }

  getScreenXof(el, dt, t) {
    let sprite = (el instanceof PIXI.Sprite) ? el : el.sprite;
    if (this.ship instanceof Ship && sprite instanceof PIXI.Sprite &&
      (typeof el.depth === 'number') && (typeof sprite.position.x === 'number')) {
      //World is round sprite can be be nearer left or right
      //take width of sprite as margin to not make it disappear once it touch a border of the screen
      return this.mod(sprite.position.x + sprite.width - el.depth * this.ship.vx * dt, this.worldWidth) - sprite.width;
    }
    return -50;
  }
};