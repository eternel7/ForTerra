const PIXI = require('pixi.js');
const control = require('./controls');
const Bump = require('./collision');
const bump = new Bump();

module.exports = class Ship {

  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  constructor(config) {

    // user defined properties
    this._game = config.parent;

    this._game.on('update', this.update.bind(this));

    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.shipColor = config.color || false;
    this.count = 0;
    this.xOffset = config.xOffset || Math.floor(this.renderer.width / 2);
    this.yOffset = config.yOffset || Math.floor(this.renderer.height / 4);
    this.depth = 1;
    this.MAX_HEALTH = this.health = config.health || 100;

    this.accelerationX = 2 / 1000;
    this.accelerationY = 1 / 1000;
    // Time that passes between acceleration
    this.dx = 5 / 50;
    this.dy = 5 / 50;
    this.maxSpeedX = 3;
    this.maxSpeedY = 1;

    this.state = 1; // -1 boom - 1 start - other number for other animations
    this._timeLastBulletFired = 0;
    // Time that passes between shots
    this.FIRE_INTERVAL = 500;
    this.HIGHLIGHT_INTERVAL = 100;

    //ship size and position in sprite sheet
    this.sprites = {
      horizontal: {
        x: 1734,
        y: 1408,
        w: 122,
        h: 52
      },
      a: {
        x: 1730,
        y: 1356,
        w: 127,
        h: 48
      },
      b: {
        x: 1732,
        y: 1302,
        w: 103,
        h: 44
      },
      vertical: {
        x: 1730,
        y: 1249,
        w: 109,
        h: 46
      }
    };

    this.texture = (config.texture || PIXI.utils.TextureCache["ships"]);

    //Create a rectangle object that defines the position and
    //size of the sub-image you want to extract from the texture
    this.Rect = {};
    for (var pos in this.sprites) {
      this.Rect[pos] = new PIXI.Rectangle(this.sprites[pos].x,
        this.sprites[pos].y,
        this.sprites[pos].w,
        this.sprites[pos].h)
    }

    //Tell the texture to use that rectangular section
    this.texture.frame = this.Rect.vertical;

    //Create the ship from the texture
    this._ship = new PIXI.Sprite(this.texture);
    this._ship.anchor = new PIXI.Point(0.5, 0.5);
    this._ship.x = this.xOffset;
    this._ship.y = this.yOffset;
    this.worldX = Math.random() * this._game.worldWidth;
    this.worldY = this.yOffset;

    if (this.shipColor) {
      this._ship.tint = this.shipColor;
    }

    //Life bar UI
    this.lifeBarContainer = new PIXI.Container();
    this.lifeBarTexture = PIXI.utils.TextureCache["UIBar01"];
    this.lifeBarTexture.frame = new PIXI.Rectangle(61, 128, 270, 79);
    this.lifeBar = new PIXI.Sprite(this.lifeBarTexture);
    this.lifeBar.scale.set(0.8, 0.5);
    this.lifeBarWidthMax = 150;
    this.lifeBarX = 33;
    this.lifeBarGauge = new PIXI.Graphics();
    this.lifeBarContainer.addChild(this.lifeBarGauge);
    this.lifeBarContainer.addChild(this.lifeBar);
    this.lifeBarGauge.beginFill(0x00FF00);
    // draw a rectangle
    this.lifeBarGauge.drawRect(this.lifeBarX, 14, this.lifeBarWidthMax, 24);

    this.lifeBarTextStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 5
    });
    this.lifeBarText = new PIXI.Text(this.health + "/" + this.MAX_HEALTH, this.lifeBarTextStyle);
    this.lifeBarText.position.x = Math.floor(this.lifeBarContainer.width / 2 - this.lifeBarText.width / 2);
    this.lifeBarText.position.y = Math.floor(this.lifeBarContainer.height / 2 - this.lifeBarText.height / 2) + 6;
    this.lifeBarContainer.addChild(this.lifeBarText);
    this.lifeBarContainer.position.x = Math.round((this._game.renderer.width - this.lifeBarContainer.width) / 2);
    this.lifeBarContainer.position.y = this._game.renderer.height - this.lifeBarContainer.height - 15;

    //manage explosion animation
    this.explosions = [];
    this.explosionSteps = 31;
    for (var i = 0; i <= this.explosionSteps; i++) {
      this.explosions.push(PIXI.utils.TextureCache["expl_06_00" + this.pad(i, 2, '0') + ".png"]);
    }
    this.explosion = new PIXI.extras.AnimatedSprite(this.explosions);

    // create a random instability for the ship between 1 - 5
    this.instability = (1 + Math.random() * 5);
    this.vx = 0;
    this.vy = 0;

    this.stage.addChild(this._ship, this.lifeBarContainer);
  }

  updateLifeBarStyle() {
    this.lifeBarGauge.clear();
    if (this.health > 0) {
      var f = ( this.health / this.MAX_HEALTH );
      var g = Math.floor(f * 255);
      var r = Math.floor(( 1 - f ) * 255);
      this.lifeBarGauge.beginFill("0x" + r.toString(16) + g.toString(16) + "00");
      // draw a rectangle
      this.lifeBarGauge.drawRect(this.lifeBarX, 14, Math.floor(this.lifeBarWidthMax * f), 24);
      this.lifeBarTextStyle.fill = ['#ffffff', '#' + this.pad(r.toString(16), 2, '0') + this.pad(g.toString(16), 2, '0') + '00'];
      this.lifeBarText.text = this.health + "/" + this.MAX_HEALTH + "        " + Math.round(this.worldX);
      this.lifeBarText.position.x = Math.floor(this.lifeBarContainer.width / 2 - this.lifeBarText.width / 2);
    } else {
      this.lifeBarText.text = "0/" + this.MAX_HEALTH;
    }
  }

  /**
   * Check if the spaceship was hit by a bullet
   *
   * @param   {PIXI.Point} bulletPosition
   *
   * @public
   * @returns {Boolean} wasHit
   */
  checkHit(hitbox, objectDamage) {
    var touched = false;
    if (hitbox instanceof PIXI.Graphics) {
      touched = false;
    } else if (hitbox.Rectangle instanceof PIXI.Rectangle) {
      touched = this._ship.hitTestRectangle(hitbox.Rectangle);
    } else if (hitbox.position instanceof PIXI.Point || hitbox.position instanceof PIXI.ObservablePoint) {
      touched = this._ship.containsPoint(hitbox.position);
    }
    if (touched) {
      // Ok, we're hit. Flash red
      this._ship.tint = 0xFF0000;
      this.hitHighlightStart = performance.now();

      // Remove decrement health by object damage
      this.health -= objectDamage;

      if (this.health <= 0) {
        // oh dear, we're dead
        this.state = -1;
        this.explosion.position.x = this._ship.position.x;
        this.explosion.position.y = this._ship.position.y;
        this._ship.position.x = -50;
        this._ship.position.y = -50;
        this.explosion.anchor.x = 0.5;
        this.explosion.anchor.y = 0.5;
        this.explosion.rotation = 0;
        this.explosion.animationSpeed = 0.3;
        this.explosion.loop = false;
        this._game.stage.addChild(this.explosion);
        this.explosion.play();
        this.updateLifeBarStyle();
      } else {
        // still alive, but taken some damage. Update text color from green to red
        this.updateLifeBarStyle();
      }
      return true;
    }
    return false;
  }

  accelerateX(more, dt, t) {
    //manage ship speed and position
    var posMargin = 2 * this.instability;
    if (more === true) {
      this.xOffset = Math.min(this.xOffset + this.dx * dt, this.renderer.width - posMargin - 2 * this.sprites.horizontal.w);
      this.vx = Math.min(this.vx + this.accelerationX * dt, this.maxSpeedX);
    } else {
      this.xOffset = Math.max(this.xOffset - this.dy * dt, posMargin + 2 * this.sprites.horizontal.w);
      this.vx = Math.max(this.vx - this.accelerationX * dt, -1 * this.maxSpeedX);
    }
  }

  accelerateY(more, dt, t) {
    if (more === true) {
      this.yOffset = Math.min(this.yOffset + this.dy * dt, this.renderer.height - this.sprites.horizontal.h);
      this.vy = Math.min(this.vy + this.accelerationY * dt, this.maxSpeedY);
    } else {
      this.yOffset = Math.max(this.yOffset - this.dy * dt, 0);
      this.vy = Math.max(this.vy - this.accelerationY * dt, -1 * this.maxSpeedY);
    }
  }

  accelerate(more, dt, t) {
    if (more === true) {
      this.vx = (this.vx < 0) ? Math.max(-1 * this.maxSpeedX, this.vx - this.accelerationX * dt) : Math.min(this.maxSpeedX, this.vx + this.accelerationX * dt);
    } else {
      this.vx = (this.vx > 0) ? Math.max(0, this.vx - this.accelerationX * dt) : Math.min(0, this.vx + this.accelerationX * dt);
      this.vy = (this.vy > 0) ? Math.max(0, this.vy - this.accelerationY * dt) : Math.min(0, this.vy + this.accelerationY * dt);
    }
  }

  catchControl(dt, currentTime) {
    //Capture the keyboard arrow keys
    if (control.isDown(control.UP) || control.isDown(control.UP2)) {
      this.accelerateY(false, dt, currentTime);
    }
    if (control.isDown(control.LEFT) || control.isDown(control.LEFT2)) {
      this.accelerateX(false, dt, currentTime);
    }
    if (control.isDown(control.DOWN) || control.isDown(control.DOWN2)) {
      this.accelerateY(true, dt, currentTime);
    }
    if (control.isDown(control.RIGHT) || control.isDown(control.RIGHT2)) {
      this.accelerateX(true, dt, currentTime);
    }
    if (control.isDown(control.SPACE)) {
      if (currentTime > this._timeLastBulletFired + this.FIRE_INTERVAL) {
        //shooting a bullet
        this._game.bulletManager.add(this._ship.x, this._ship.y, this.vx, this);
        this._timeLastBulletFired = currentTime;
      }
    }
    if (control.isDown(control.ACCELERATE)) {
      this.accelerate(true, dt, currentTime);
    } else if (control.isDown(control.DECELERATE)) {
      this.accelerate(false, dt, currentTime);
    }
  }

  update(dt, currentTime) {
    // make the ship move a little
    this.count += 0.01;
    if (isNaN(this.hitHighlightStart) == false && currentTime > this.hitHighlightStart + this.HIGHLIGHT_INTERVAL) {
      this._ship.tint = 16777215;
      this.hitHighlightStart = false;
    }
    if (this.state == -1) {
      this.health = 0;
      this.vx = 0;
      this.vy = 0;
    } else {
      this.catchControl(dt, currentTime);
      //update texture for animation of the turn in speed
      if (Math.abs(this.vx) > 1) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.horizontal;
      } else if (Math.abs(this.vx) > 0.5) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.a;
      } else if (Math.abs(this.vx) > 0.25) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.b;
      } else {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.vertical;
      }
      //Create the ship from the texture
      this._ship.texture = this.texture;
      this._ship.position.x = this.xOffset;
      this._ship.position.y = this.yOffset;
      if (this.shipColor) {
        this._ship.tint = this.shipColor;
      }
      //make the ship move a little
      this._ship.position.x += Math.sin(this.count * 5) * this.instability;
      this._ship.position.y += Math.cos(this.count * 5) * this.instability;

      this.worldX = this._game.mod(( this.worldX + this._game.ship.vx * dt ), this._game.worldWidth);
      this.worldY += this._game.ship.vy * dt;
      this.updateLifeBarStyle();

      //ship orientation
      if (this.vx < 0 && this._ship.scale.x < 0) {
        this._ship.scale.x = 1;
      } else if (this.vx >= 0 && this._ship.scale.x > 0) {
        this._ship.scale.x = -1;
      }
    }
  }
}