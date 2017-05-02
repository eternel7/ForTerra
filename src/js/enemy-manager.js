const PIXI = require('pixi.js');
const Bump = require('./collision');
const bump = new Bump();

module.exports = class EnemyManager {

  constructor(config) {
    this._game = config.parent;
    this._game.on('update', this.update.bind(this));
    this.activeEnemies = [];
    this.passiveEnemies = [];
    this.initialEnemies = config.initialEnemies || 10;
    this.texture = (config.texture || PIXI.utils.TextureCache["asteroids"]);
    this._timeLastHit = 0;
    this.HIT_INTERVAL = 200;
    this.texture.frame = new PIXI.Rectangle(0,
      0,
      128,
      128);
    //Moving sprites : enemies
    for (let i = 0; i <= this.initialEnemies; i++) {
      this.createEnemy({
        texture: this.texture,
        parent: this._game
      });
    }
  }

  moveFunction(el, dt, t) {
    el.sprite.rotation = Math.min(1, el.randomNumberX) * t / 1000 + el.randomNumberX;
    return {x: el.randomNumberX + 1, y: Math.cos(t / 1000) * 50 + this.randomNumberY * t / 1000};
  }

  update(dt, t) {
    const ship = this._game.ship;
    console.log(this.activeEnemies.length);
    for (let i = 0; i < this.activeEnemies.length; i++) {
      let enemy = this.activeEnemies[i];
      enemy.sprite.position.x = this._game.getScreenXof(enemy, dt, t);
      enemy.sprite.position.y = enemy.worldY - ship.worldY;
      if (enemy.moveFunction) {
        let relativeMove = enemy.moveFunction(enemy, dt, t);
        if (relativeMove && (typeof relativeMove === 'object')) {
          enemy.sprite.position.x += relativeMove.x;
          enemy.sprite.position.y += relativeMove.y;
        }
      }
      if (enemy.hittingBox) {
        let x = enemy.sprite.x - enemy.sprite.width / 2;
        let y = enemy.sprite.y - enemy.sprite.height / 2;
        let w = enemy.sprite.width;
        let h = enemy.sprite.height;
        if (enemy.hittingBox.relativeRectangle) {
          x += enemy.hittingBox.relativeRectangle.x;
          y += enemy.hittingBox.relativeRectangle.y;
          w += enemy.hittingBox.relativeRectangle.w;
          h += enemy.hittingBox.relativeRectangle.h;
        }
        enemy.hittingBox.rectangle.x = x;
        enemy.hittingBox.rectangle.y = y;
        enemy.hittingBox.rectangle.width = w;
        enemy.hittingBox.rectangle.height = h;
        if (enemy.hitbox) {
          enemy.hitbox.clear();
          enemy.hitbox.lineStyle(1, 0xa0ee00, 1);
          enemy.hitbox.drawRect(x, y, w, h);
        }
      }
      if (enemy.hittingBox) {
        for (let s = 0; s < this._game.spaceShips.length; s++) {
          this._game.spaceShips[s].checkHit(enemy.hittingBox, enemy.damage, t);
        }
      }
    }
  }

  /**
   * Check if the spaceship was hit by a bullet
   *
   * @param   {object} hitbox
   * @param   {Number} objectDamage
   *
   * @public
   * @returns {Boolean} wasHit
   */
  checkHit(hitbox, objectDamage, currentTime) {
    if (currentTime > this._timeLastHit + this.HIT_INTERVAL) {
      let touched = false;
      if (hitbox instanceof PIXI.Graphics) {
        touched = false;
      } else if (hitbox.rectangle instanceof PIXI.Rectangle) {
        touched = bump.hitTestRectangle(hitbox.rectangle, this.sprite);
      } else if (hitbox.sprite instanceof PIXI.Sprite) {
        touched = bump.rectangleCollision(this.sprite, hitbox.sprite);
      } else if (hitbox.position instanceof PIXI.Point || hitbox.position instanceof PIXI.ObservablePoint) {
        touched = this.sprite.containsPoint(hitbox.position);
      }
      if (touched) {
        this.recycleEnemy(this.sprite, hitbox.enemyId);
        return true;
      }
    }
    return false;
  }

  recycleEnemy(sprite, i) {
    sprite.position.x = -50;
    sprite.position.y = -50;
    sprite.rotation = 0;
    sprite.damage = 0;
    let enemy = this.game.enemyManager.activeEnemies[i];
    this.game.enemyManager.activeEnemies.splice(i, 1);
    enemy.sprite.destroy();
    this.game.enemyManager.passiveEnemies.push(enemy);
  }

  createEnemy(config) {
    let sprite = new PIXI.Sprite(config.texture);
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.position.x = Math.random() * this._game.worldWidth * 0.8;
    sprite.position.y = (this._game.renderer.height - 350) * Math.random();
    let enemy = {
      sprite: sprite,
      depth: 1,
      worldX: sprite.position.x,
      worldY: sprite.position.y,
      hittingBox: {
        sprite: sprite,
        rectangle: config.texture.frame,
        relativeRectangle: {
          x: 0,
          y: 0,
          w: 0,
          h: 0
        },
      },
      damage: 0,
      checkHit: this.checkHit,
      recycleEnemy: this.recycleEnemy,
      _timeLastHit: this._timeLastHit,
      HIT_INTERVAL: this.HIT_INTERVAL,
      moveFunction: this.moveFunction,
      randomNumberX: Math.round(10 * Math.random()),
      randomNumberY: Math.round(10 * Math.random()),
      game: this._game
    };
    this.activeEnemies.push(enemy);

    this._game.stage.addChild(sprite);
  }
};