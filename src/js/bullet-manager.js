const PIXI = require('pixi.js');
const MovingSprite = require('./models/movingSprite');

module.exports = class BulletManager {
  constructor(config) {
    this._game = config.parent;
    this._game.on('update', this.update.bind(this));
    this._activeBullets = [];
    this._passiveBullets = [];
    this.texture = (config.texture || PIXI.utils.TextureCache["bullet_purple0004.png"]);
    //this.texture.frame = new PIXI.Rectangle(309, 263, 16, 16);
    for (let i = 0; i < config.initialBullets; i++) {
      this.createBullet();
    }
  }

  add(x, y, rotation, spaceShip) {
    if (this._passiveBullets.length === 0) {
      this.createBullet();
    }

    let bullet = this._passiveBullets.pop();
    bullet.sprite.position.x = x;
    bullet.sprite.position.y = y;
    bullet.worldX = spaceShip.worldX;
    bullet.worldY = spaceShip.worldY + spaceShip.yOffset ;
    bullet.distX = 0;
    bullet.maxDist = spaceShip.weaponMaxDist || this._game.worldWidth * 0.5;
    bullet.duration = 0;
    bullet.maxDuration = spaceShip.weaponmaxDuration || 5000; //in milliseconds
    bullet.friction = spaceShip.weaponFriction || 0.001;
    bullet.normalSpeed = spaceShip.weaponSpeed || 3;
    bullet.vx = (bullet.normalSpeed + Math.abs(spaceShip.vx)) * Math.sin(rotation);
    bullet.vy = 0;
    bullet.damage = spaceShip.weaponDamage || 5;
    bullet.sprite.rotation = rotation;
    bullet.sprite.position.y = bullet.worldY;
    bullet.source = spaceShip;

    this._activeBullets.push(bullet);
  }
  update(dt, t) {
    let i, s, bullet;

    for (i = 0; i < this._activeBullets.length; i++) {
      bullet = this._activeBullets[i];
      let distX = Math.sin(bullet.sprite.rotation) * bullet.vx * dt;
      bullet.distX += Math.abs(distX);
      bullet.duration += dt;
      if (bullet.distX > bullet.maxDist ||
        bullet.duration > bullet.maxDuration) {
        // Bullet made the max distance it could, time to recycle it
        this.recycle(bullet, i);
      } else {
        bullet.move(bullet, dt, t);
        // Bullet is still on stage, let's perform hit detection
        for (s = 0; s < this._game.spaceShips.length; s++) {
          if (this._game.spaceShips[s] === bullet.source) {
            continue;
          }
          if (this._game.spaceShips[s].checkHit({sprite: bullet.sprite}, bullet.damage, t)) {
            this.recycle(bullet, i);
          }
        }
        for (s = 0; s < this._game.enemyManager.activeEnemies.length; s++) {
          let enemy = this._game.enemyManager.activeEnemies[s];
          enemy.enemyId = s;
          if (enemy.checkHit({sprite: bullet.sprite}, bullet.damage, t)) {
            this.recycle(bullet, i);
          }
        }
      }
    }
  }

  recycle(bullet, i) {
    bullet.sprite.x = -500;
    bullet.sprite.y = -500;
    bullet.sprite.rotation = 0;
    bullet.source = null;
    this._activeBullets.splice(i, 1);
    this._passiveBullets.push(bullet);
  }

  createBullet() {
    let bullet = new MovingSprite({parent: this._game});
    bullet.setSprite(new PIXI.Sprite(this.texture));
    bullet.sprite.x = -500;
    bullet.sprite.y = -500;
    bullet.act = function (el, dt, t) {
      this.vx = Math.max(this.vx - this.friction, this.normalSpeed) * Math.sin(bullet.sprite.rotation);
    };
    this._passiveBullets.push(bullet);
    //drawing bullet
    this._game.stage.addChild(bullet.sprite);
  }
};