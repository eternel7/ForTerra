const PIXI = require('pixi.js');
const MovingSprite = require('./models/movingSprite');

module.exports = class Planet extends MovingSprite {
  constructor(config) {
    super(config);
    const planets = PIXI.loader.resources["planetsSpritesheet"].textures;
    this.setSprite(new PIXI.Sprite(planets[config.name || ("planet" + Math.round(Math.random() * 20) + ".png")]));
    this.sprite.anchor = new PIXI.Point(0.5, 0.5);
    let scale = Math.random() * 0.8 + 0.2;
    this.sprite.scale.x = scale;
    this.sprite.scale.y = scale;
    this.sprite.position.x = Math.random() * this._game.renderer.width - this.sprite.width*0.5;
    this.sprite.position.y = Math.random() * 150 + 300;
    this.worldX = this.sprite.position.x;
    this.worldY = this.sprite.position.y;
    this.depth = 0.05;
    this.damage = 0;
  }

  move(el, dt, t) {
    return {x: 0.05, y: 0};
  }
};