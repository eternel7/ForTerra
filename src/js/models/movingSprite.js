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
};