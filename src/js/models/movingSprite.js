const PIXI = require('pixi.js');

module.exports = class Movingsprite {
  constructor(config) {
    this._game = config.game;
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

  move(el, dt, t) {
    this.sprite.position.x += dt * this.vx * this.depth * Math.sin(this.sprite.rotation);
    this.sprite.position.y += dt * this.vy * this.depth * Math.cos(this.sprite.rotation);
  }
};