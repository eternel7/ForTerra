const PIXI = require('pixi.js');
const Explosion = require('./explosion');


let explosionNameInfo = {
  "expl_01_00": {steps: 23, duration: 5000},
  "expl_02_00": {steps: 23, duration: 5000},
  "expl_03_00": {steps: 23, duration: 5000},
  "expl_04_00": {steps: 23, duration: 5000},
  "expl_06_00": {steps: 31, duration: 6000},
  "expl_07_00": {steps: 31, duration: 5000},
  "hit_00": {steps: 8, duration: 5000},
  "expl_11_00": {steps: 23, duration: 5000},
  "puff_smoke_01_00": {steps: 31, duration: 6000}
};

module.exports = class ExplosionManager {

  constructor(config) {
    this._game = config.parent;
    this._game.on('update', this.update.bind(this));
    this._activeExplosions = [];
    this._passiveExplosions = [];
  }

  spriteExplode(sprite, config) {
    //manage explosion animation
    let explosion = new Explosion({
      parent: this._game,
      explosionName: config.explosionName || undefined,
      explosionSteps: explosionNameInfo[config.explosionName].steps
    });

    explosion.sprite.position.x = sprite.position.x;
    explosion.sprite.position.y = sprite.position.y;
    explosion.sprite.anchor.x = 0.5;
    explosion.sprite.anchor.y = 0.5;
    explosion.sprite.rotation = config.rotation || sprite.rotation;
    explosion.sprite.animationSpeed = config.animationSpeed || 0.3;
    explosion.sprite.loop = false;
    if (config.el.vx && config.el.vy) {
      explosion.vx = config.el.vx;
      explosion.vy = config.el.vy;
      explosion.worldX = config.el.worldX;
      explosion.worldY = config.el.worldY;
    }
    this._game.stage.addChild(explosion.sprite);
    explosion.startTime = window.performance.now();
    explosion.duration = explosionNameInfo[config.explosionName].duration || 5000;
    explosion.sprite.play();
    this._activeExplosions.push(explosion);
  }

  update(dt, currentTime) {
    let i, explosion;
    const ship = this._game.ship;

    for (i = 0; i < this._activeExplosions.length; i++) {
      explosion = this._activeExplosions[i];
      if (explosion && currentTime > explosion.startTime + explosion.duration * explosion.sprite.animationSpeed) {
        this.recycle(explosion, i);
      }
      if (explosion.sprite.scale.x > 0) {
        explosion.sprite.position.x = this._game.getScreenXof(explosion, dt, currentTime);
        explosion.sprite.position.y = explosion.worldY - ship.worldY;
        explosion.move(explosion, dt, currentTime);
      }
    }
  }

  recycle(explosion, pos) {
    this._activeExplosions.splice(pos, 1);
    this._passiveExplosions.push(explosion);
    explosion.sprite.position.x = -500;
    explosion.sprite.position.y = -500;
    explosion.sprite.rotation = 0;
    explosion.sprite.scale.set(0, 0);
  }
};
