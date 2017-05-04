const PIXI = require('pixi.js');

module.exports = class Enemy {

  constructor(config) {
    this._game = config.parent;
    this.enemyId = undefined; //unknown place in this._game.enemyManager.activeEnemies
    config.texture.frame = new PIXI.Rectangle(0,
      0,
      128,
      128);
    let sprite = new PIXI.Sprite(config.texture);
    sprite.position.x = Math.random() * this._game.worldWidth * 0.8;
    sprite.position.y = (this._game.renderer.height / 4) * Math.random();
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.scale.x = 0.5;
    sprite.scale.y = 0.5;
    this.worldX = sprite.position.x;
    this.worldY = sprite.position.y;
    this.sprite = sprite;
    this.depth = 1;

    this.randomNumberX = Math.round(10 * Math.random());
    this.randomNumberY = Math.round(10 * Math.random());
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
    this.damage = 10;
    this._timeLastHit = 0;
    this.HIT_INTERVAL = 200;
    //this.hitbox = new PIXI.Graphics();

    this._game.stage.addChild(sprite);

    if (this.hitbox instanceof PIXI.Graphics) {
      this._game.stage.addChild(this.hitbox);
    }
  }


  moveFunction(el, dt, t) {
    el.sprite.rotation = Math.min(1, el.randomNumberX) * t / 1000 + el.randomNumberX;
    return {x: el.randomNumberX + 1, y: Math.cos(t / 1000) * 50 + this.randomNumberY * t / 1000};
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
    let i = this.enemyId;
    let sprite = this.sprite;
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