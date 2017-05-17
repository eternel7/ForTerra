const PIXI = require('pixi.js');
const MovingSprite = require('./models/movingSprite');

module.exports = class Enemy extends MovingSprite {

  constructor(config) {
    super(config);
    this.enemyId = undefined; //unknown place in this._game.enemyManager.activeEnemies
    let sprite = new PIXI.Sprite(config.texture);
    sprite.position.x = Math.random() * this._game.worldWidth * 0.8;
    sprite.position.y = (this._game.renderer.height / 4) * Math.random() + this._game.renderer.height / 6;
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.scale.x = 1;
    sprite.scale.y = 1;
    this.sprite = sprite;
    this.worldX = sprite.position.x;
    this.worldY = sprite.position.y;
    this.depth = 1;

    this.randomNumberX = 1/5 * Math.random() + 1/100;
    this.randomNumberY = 1/10 * Math.random() + 1/100;
    this.randomNumberSpeed = Math.round(Math.random());
    this.vx = (this.randomNumberSpeed > 0.5) ? this.randomNumberX : -1 * this.randomNumberX;

    this.hittingBox = {
      sprite: sprite,
      rectangle: sprite.texture.frame.clone(),
      relativeRectangle: {
        x: 7,
        y: 10,
        w: -14,
        h: -20
      }
    };
    this.damage = 0;
    this._timeLastHit = 0;
    this.HIT_INTERVAL = 200;
    //this.hitbox = new PIXI.Graphics();

    this._game.stage.addChild(sprite);

    if (this.hitbox instanceof PIXI.Graphics) {
      this._game.stage.addChild(this.hitbox);
    }
  }

  act(el, dt, t) {
    this.vy = Math.cos(t / 1000) /20 + this.randomNumberY * t / 100000;
  }

  /**
   * Check if the spaceship was hit by a bullet
   *
   * @param   {object} hitbox
   * @param   {Number} objectDamage
   * @param   {Number} currentTime
   *
   * @public
   * @returns {Boolean} wasHit
   */
  checkHit(hitbox, objectDamage, currentTime) {
    let touched = this._game.checkHit(hitbox, this.sprite);
    if (touched) {
      this.recycleEnemy();
      return true;
    }
    return false;
  }

  recycleEnemy() {
    return;
    let i = this.enemyId;
    let sprite = this.sprite;
    this._game.explosionManager.spriteExplode(sprite, {explosionName: "expl_11_00", el: this});
    sprite.position.x = -500;
    sprite.position.y = -500;
    sprite.rotation = 0;
    sprite.scale.set(0, 0);
    sprite.damage = 0;
    if (this.hitbox instanceof PIXI.Graphics) {
      this.hitbox.clear();
    }
    this._game.enemyManager.activeEnemies.splice(i, 1);
    this._game.enemyManager.passiveEnemies.push(this);
  }
};