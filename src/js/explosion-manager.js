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

    this.explosion.position.x = sprite.position.x;
    this.explosion.position.y = sprite.position.y;
    this.explosion.anchor.x = 0.5;
    this.explosion.anchor.y = 0.5;
    this.explosion.rotation = config.rotation || sprite.rotation;
    this.explosion.animationSpeed = config.animationSpeed || 0.3;
    this.explosion.loop = false;
    if (config.el && config.el.move) {
      this.explosion.relativeMove = config.el.move(config.el, 1, 1);
      this.explosion.relativeMove.x -= this._game.ship.vx;
      this.explosion.relativeMove.y -= this._game.ship.vy;
    }
    this._game.stage.addChild(this.explosion);
    this.explosion.startTime = window.performance.now();
    this.explosion.duration = explosionNameInfo[config.explosionName].duration || 5000;
    this.explosion.play();
    this._activeExplosions.push(this.explosion);
  }

  move(el, dt, t) {
    //TODO : move of explosion should be relative to ship speed
    let def = {x: 0, y: 1};
    if(el.sprite.relativeMove && el.sprite.startTime){
      def.y += el.sprite.relativeMove.y/10;
      def.x += el.sprite.relativeMove.x;
    }
    return def;
  }

  update(dt, currentTime) {
    let i, s, explosion;

    for (i = 0; i < this._activeExplosions.length; i++) {
      explosion = this._activeExplosions[i];
      if (explosion && currentTime > explosion.startTime + explosion.duration * explosion.animationSpeed) {
        this.recycle(explosion, i);
      }
      if (explosion.scale.x > 0) {
        let relativeMove = this.move({sprite: explosion}, dt, currentTime);

        if (relativeMove && (typeof relativeMove === 'object')) {
          explosion.position.x += relativeMove.x;
          explosion.position.y += relativeMove.y;
        }
      }
    }
  }

  recycle(explosion, pos) {
    this._activeExplosions.splice(pos, 1);
    this._passiveExplosions.push(explosion);
    explosion.position.x = -500;
    explosion.position.y = -500;
    explosion.rotation = 0;
    explosion.scale.set(0, 0);
  }
};
