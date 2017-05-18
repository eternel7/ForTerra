const PIXI = require('pixi.js');
const Enemy = require('./enemy');

module.exports = class EnemyManager {

  constructor(config) {
    this._game = config.parent;
    this._game.on('update', this.update.bind(this));
    this.activeEnemies = [];
    this.passiveEnemies = [];
    this.initialEnemies = config.initialEnemies || 10;
    this.texture = (config.texture || PIXI.utils.TextureCache["ships"]);
    this.texture = this.texture.clone();
    this.texture.frame = new PIXI.Rectangle(2456,
      370,
      132,
      80);
    //Moving sprites : enemies
    for (let i = 0; i <= this.initialEnemies; i++) {
      this.createEnemy({
        texture: this.texture,
        parent: this._game
      });
    }
  }

  update(dt, t) {
    for (let i = 0; i < this.activeEnemies.length; i++) {
      let enemy = this.activeEnemies[i];
      enemy.enemyId = i;
      if (enemy.move) {
        enemy.move(enemy, dt, t);
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
        for (let s = 0; s < this._game.spaceShips.length; s++) {
          this._game.spaceShips[s].checkHit(enemy.hittingBox, enemy.damage, t);
        }
      }
    }
  }

  createEnemy(config) {
    let enemy = new Enemy({
      parent: this._game,
      texture: config.texture
    });
    this.activeEnemies.push(enemy);
    enemy.enemyId = this.activeEnemies.length - 1;
  }
};