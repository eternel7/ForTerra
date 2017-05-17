const PIXI = require('pixi.js');

module.exports = class MovingSprite {
  constructor(config) {
    this._game = config.parent;
    this.sprite = undefined;
    this.vx = 1 / 50;
    this.vy = 0;
    this.depth = 1;
    this.worldX = 0;
    this.worldY = 0;
  }

  setSprite(sprite) {
    this.sprite = sprite;
    this.sprite.rotation = 0;
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
  }

  act(el, dt, t) {
   //by default not active => do not change of speed
  }

  move(el, dt, t) {
    if(this.act){
      //active sprite can change their speed
      this.act(el,dt,t);
    }
    this.worldX = this._game.mod(this.worldX + this.vx * dt,this._game.worldWidth);
    this.worldY = this.worldY + this.vy * dt;
  }
};