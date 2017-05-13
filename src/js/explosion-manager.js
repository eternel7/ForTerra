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
    this.explosion = new Explosion({
      parent: this._game,
      explosionName: config.explosionName || undefined,
      explosionSteps: explosionNameInfo[config.explosionName].steps
    });

    this.explosion.sprite.position.x = sprite.position.x;
    this.explosion.sprite.position.y = sprite.position.y;
    this.explosion.sprite.anchor.x = 0.5;
    this.explosion.sprite.anchor.y = 0.5;
    this.explosion.sprite.rotation = config.rotation || sprite.rotation;
    this.explosion.sprite.animationSpeed = config.animationSpeed || 0.3;
    this.explosion.sprite.loop = false;
    if (config.el && config.el.move) {
      this.explosion.relativeMove = config.el.move(config.el, 1, 1);
      this.explosion.relativeMove.x -= this._game.ship.vx;
      this.explosion.relativeMove.y -= this._game.ship.vy;
    }
    this._game.stage.addChild(this.explosion.sprite);
    this.explosion.startTime = window.performance.now();
    this.explosion.duration = explosionNameInfo[config.explosionName].duration || 5000;
    this.explosion.sprite.play();
    this._activeExplosions.push(this.explosion);
  }

  move(el, dt, t) {
    //TODO : move of explosion should be relative to ship speed
    el.sprite.position.x += dt * el.vx * el.depth * Math.sin(el.sprite.rotation);
    el.sprite.position.y += dt * el.vy * el.depth * Math.cos(el.sprite.rotation);
  }

  update(dt, currentTime) {
    let i, s, explosion;

    for (i = 0; i < this._activeExplosions.length; i++) {
      explosion = this._activeExplosions[i];
      if (explosion && currentTime > explosion.startTime + explosion.duration * explosion.animationSpeed) {
        this.recycle(explosion, i);
      }
      if (explosion.sprite.scale.x > 0) {
        this.move(explosion, dt, currentTime);
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
