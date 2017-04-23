const PIXI = require('pixi.js');


module.exports = class BulletManager {
  constructor(config) {
    this._game = config.parent;
    this._game.on('update', this.update.bind(this));
    this.speed = 7;
    this._activeBullets = [];
    this._passiveBullets = [];
    this.texture = (config.texture || PIXI.utils.TextureCache["bullets"]);
    this.texture.frame = new PIXI.Rectangle(309,
      263,
      16,
      16);
    for (var i = 0; i < config.initialBullets; i++) {
      this.createBullet();
    }
  }

  add(x, y, shipSpeedDirection, spaceShip) {
    if (this._passiveBullets.length === 0) {
      this.createBullet();
    }

    var bullet = this._passiveBullets.pop();
    bullet.tint = spaceShip._ship.tint;
    bullet.position.x = x;
    bullet.position.y = y;
    bullet.rotation = (shipSpeedDirection>=0) ? Math.PI/2 : -1*Math.PI/2;
    bullet.source = spaceShip;
    this._activeBullets.push(bullet);
  }

  update() {
    var i, s, bullet;

    for (i = 0; i < this._activeBullets.length; i++) {
      bullet = this._activeBullets[i];
      bullet.position.x += Math.sin(bullet.rotation) * this.speed;
      bullet.position.y -= Math.cos(bullet.rotation) * this.speed;

      if (bullet.position.x < 0 ||
        bullet.position.x > this._game.renderer.width ||
        bullet.position.y < 0 ||
        bullet.position.y > this._game.renderer.height) {
        // Bullet has left the stage, time to recycle it
        this.recycleBullet(bullet, i);
      } else {
        // Bullet is still on stage, let's perform hit detection
        for (s = 0; s < this._game.spaceShips.length; s++) {
          if (this._game.spaceShips[s] === bullet.source) {
            continue;
          }
          if (this._game.spaceShips[s].checkHit(bullet,bullet.damage)) {
            this.recycleBullet(bullet, i);
            continue;
          }
        }
      }
    }
  }

  recycleBullet(bullet, i) {
    bullet.position.x = -50;
    bullet.position.y = -50;
    bullet.rotation = 0;
    bullet.source = null;
    this._activeBullets.splice(i, 1);
    this._passiveBullets.push(bullet);
  }

  createBullet() {
    var bullet = new PIXI.Sprite(this.texture);
    bullet.position.x = -50;
    bullet.position.y = -50;
    bullet.anchor.x = 0.5;
    bullet.anchor.y = 0.5;
    bullet.rotation = 0;
    bullet.damage = 5;
    this._passiveBullets.push(bullet);
    //drawing bullet
    this._game.stage.addChild(bullet);
  }
}