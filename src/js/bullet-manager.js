const PIXI = require('pixi.js');

module.exports = class BulletManager {
  constructor(config) {
    this._game = config.parent;
    this._game.on('update', this.update.bind(this));
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

    let bullet = this._passiveBullets.pop();
    bullet.tint = spaceShip._ship.tint;
    bullet.position.x = x;
    bullet.position.y = y;
    bullet.worldX = spaceShip.worldX;
    bullet.worldY = spaceShip.worldY;
    bullet.distX = 0;
    bullet.maxDist = spaceShip.weaponMaxDist || 3500;
    bullet.speed = spaceShip.weaponSpeed || 3 ;
    bullet.damage = spaceShip.weaponDamage || 5;
    bullet.rotation = (shipSpeedDirection >= 0) ? Math.PI / 2 : -1 * Math.PI / 2;
    bullet.source = spaceShip;
    this._activeBullets.push(bullet);
  }

  update(dt,t) {
    var i, s, bullet;

    for (i = 0; i < this._activeBullets.length; i++) {
      bullet = this._activeBullets[i];
      let distX = Math.sin(bullet.rotation) * bullet.speed * dt;
      bullet.distX += Math.abs(distX);
      if (bullet.distX > bullet.maxDist) {
        // Bullet made the max distance it could, time to recycle it
        this.recycleBullet(bullet, i);
      } else {
        bullet.worldX = this._game.mod(bullet.worldX + distX, this._game.worldWidth);
        let el = {
          sprite: bullet,
          depth: 1,
          worldX: bullet.worldX
        };
        bullet.position.x = this._game.getScreenXof(el);
        // Bullet is still on stage, let's perform hit detection
        for (s = 0; s < this._game.spaceShips.length; s++) {
          if (this._game.spaceShips[s] === bullet.source) {
            continue;
          }
          if (this._game.spaceShips[s].checkHit(bullet, bullet.damage)) {
            this.recycleBullet(bullet, i);
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
    let bullet = new PIXI.Sprite(this.texture);
    bullet.position.x = -50;
    bullet.position.y = -50;
    bullet.anchor.x = 0.5;
    bullet.anchor.y = 0.5;
    bullet.rotation = 0;
    this._passiveBullets.push(bullet);
    //drawing bullet
    this._game.stage.addChild(bullet);
  }
}