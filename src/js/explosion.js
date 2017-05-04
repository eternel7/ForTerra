const PIXI = require('pixi.js');

module.exports = class Explosion {

  constructor(config) {
    this._game = config.parent;
    //manage explosion animation
    let explosions = [];
    let explosionSteps = config.explosionSteps || 31;
    let explosionName =config.explositionName || "expl_06_00";
    for (let i = 0; i <= explosionSteps; i++) {
      explosions.push(PIXI.utils.TextureCache[explosionName + this._game.pad(i, 2, '0') + ".png"]);
    }
    return new PIXI.extras.AnimatedSprite(explosions);
  }
};