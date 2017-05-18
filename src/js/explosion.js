const PIXI = require('pixi.js');
const MovingSprite = require('./models/movingSprite');

module.exports = class Explosion extends MovingSprite {

  constructor(config) {
    super(config);

    this.vy = 1 / 50;
    //manage explosion animation
    let explosions = [];
    let explosionName = config.explosionName || "expl_06_00";
    let explosionSteps = config.explosionSteps || 31;
    for (let i = 0; i <= explosionSteps; i++) {
      explosions.push(PIXI.utils.TextureCache[explosionName + this._game.pad(i, 2, '0') + ".png"]);
    }
    this.setSprite(new PIXI.extras.AnimatedSprite(explosions));
  }

  act(el, dt, t) {
    this.vx = (this.vx > 0) ? Math.max(this.vx - 0.001, 0) : Math.min(this.vx + 0.001, 0);
    this.vy = Math.min(this.vy + 0.001, 0.05);
  }
};