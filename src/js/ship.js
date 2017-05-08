const PIXI = require('pixi.js');
const control = require('./controls');
const Explosion = require('./explosion');

module.exports = class Ship {

  constructor(config) {

    // user defined properties
    this._game = config.parent;

    this._game.on('update', this.update.bind(this));

    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.shipColor = config.color || false;
    this.count = 0;
    this.startXOffset = config.xOffset || Math.floor(this.renderer.width / 2);
    this.xOffset = this.startXOffset;
    this.startYOffset = config.yOffset || Math.floor(this.renderer.height / 4);
    this.yOffset = this.startYOffset;
    this.depth = 1;
    this._timeLastHit = 0;
    this.HIT_INTERVAL = 200;
    this.MAX_HEALTH = this.health = config.health || 100;

    this.accelerationX = 2 / 1000;
    // Time that passes between acceleration
    this.dx = 5 / 50;
    this.dy = 10 / 50;
    this.maxSpeedX = 2;
    // create a random instability for the ship between 0 - 1
    this.instability = 3;
    this.vx = 0;
    this.vy = 0;

    this.state = 1; // -1 boom - 1 start - other number for other animations
    this._timeLastBulletFired = 0;
    // Time that passes between shots
    this.FIRE_INTERVAL = 500;
    this.HIGHLIGHT_INTERVAL = 100;
    this.GAMEOVER_INTERVAL = 2000;
    this.GAMEOVER_ANIMATION_DURATION = 5000;
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
    for (let pos in this.sprites) {
      if (this.sprites.hasOwnProperty(pos)) {
        this.Rect[pos] = new PIXI.Rectangle(this.sprites[pos].x,
          this.sprites[pos].y,
          this.sprites[pos].w,
          this.sprites[pos].h);
      }
    }

    //Tell the texture to use that rectangular section
    this.texture.frame = this.Rect.vertical;

    //Create the ship from the texture
    this._ship = new PIXI.Sprite(this.texture);
    this._ship.anchor = new PIXI.Point(0.5, 0.5);
    this._ship.x = this.xOffset;
    this._ship.y = this.yOffset;
    this.worldX = 0;
    this.worldY = this.yOffset;
    /*
     //draw hitbox for debug
     this.hitbox = new PIXI.Graphics();
     this.hitbox.anchor = new PIXI.Point(0.5, 0.5);
     */
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


    this.stage.addChild(this._ship, this.lifeBarContainer);
  }

  updateLifeBarStyle() {
    this.lifeBarGauge.clear();
    if (this.health > 0) {
      let f = ( this.health / this.MAX_HEALTH );
      let g = Math.floor(f * 255);
      let r = Math.floor(( 1 - f ) * 255);
      this.lifeBarGauge.beginFill("0x" + r.toString(16) + g.toString(16) + "00");
      // draw a rectangle
      this.lifeBarGauge.drawRect(this.lifeBarX, 14, Math.floor(this.lifeBarWidthMax * f), 24);
      this.lifeBarTextStyle.fill = ['#ffffff', '#' + this._game.pad(r.toString(16), 2, '0') + this._game.pad(g.toString(16), 2, '0') + '00'];
      this.lifeBarText.text = this.health + "/" + this.MAX_HEALTH;
      this.lifeBarText.position.x = Math.floor(this.lifeBarContainer.width / 2 - this.lifeBarText.width / 2);
    } else {
      this.lifeBarText.text = "0/" + this.MAX_HEALTH;
    }
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
    if (currentTime > this._timeLastHit + this.HIT_INTERVAL) {
      let touched = this._game.checkHit(hitbox, this._ship);
      if (touched) {
        // Ok, we're hit. Flash red
        this._ship.tint = 0xFF0000;
        this.hitHighlightStart = performance.now();

        // Remove decrement health by object damage
        this.health -= objectDamage;

        if (this.health <= 0) {
          // oh dear, we're dead
          this.state = -1;

          this._game.explosionManager.spriteExplode(this._ship,{
            explosionName: "expl_06_00",
            el: this,
            animationSpeed: 0.3});
          this._ship.position.x = -50;
          this._ship.position.y = -50;
          this.updateLifeBarStyle();
        } else {
          // still alive, but taken some damage. Update text color from green to red
          this.updateLifeBarStyle();
        }
        this._timeLastHit = currentTime;
        return true;
      }
    }
    return false;
  }

  accelerateX(more, dt, t) {
    //manage ship speed and position
    if (more === true) {
      this.vx = Math.min(this.vx + this.accelerationX * dt, this.maxSpeedX);
    } else {
      this.vx = Math.max(this.vx - this.accelerationX * dt, -1 * this.maxSpeedX);
    }
  }

  accelerateY(more, dt, t) {
    if (more === true) {
      this.yOffset = Math.min(this.yOffset + this.dy * dt, this.renderer.height - this.sprites.horizontal.h);
    } else {
      this.yOffset = Math.max(this.yOffset - this.dy * dt, Math.round(this.sprites.horizontal.h / 2));
    }
  }

  accelerate(more, dt, t) {
    if (more === true) {
      this.vx = (this.vx < 0) ? Math.max(-1 * this.maxSpeedX, this.vx - this.accelerationX * dt) : Math.min(this.maxSpeedX, this.vx + this.accelerationX * dt);
    } else {
      this.vx = (this.vx > 0) ? Math.max(0, this.vx - this.accelerationX * dt) : Math.min(0, this.vx + this.accelerationX * dt);
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
        this._game.bulletManager.add(this._ship.x, this._ship.y, (this.vx >= 0) ? 1 : -1, this);
        this._timeLastBulletFired = currentTime;
      }
    }
    if (control.isDown(control.ACCELERATE)) {
      this.accelerate(true, dt, currentTime);
    } else if (control.isDown(control.DECELERATE)) {
      this.accelerate(false, dt, currentTime);
    }
  }

  restart() {
    this.restartTime = performance.now();
    this.state = 1;
    this.gameOver.position.x = -500;
    this.gameOver.position.y = -500;
    this.gameOver.scale.x = 0;
    this.xOffset = this.startXOffset;
    this.yOffset = this.startYOffset;
    this.health = this.MAX_HEALTH;
    this.gameOverTime = 0;
    this.endTime = 0;
  }

  addGameOver(currentTime) {
    this.gameOver = new PIXI.Sprite(PIXI.utils.TextureCache["gameOver"]);
    this.gameOver.anchor = new PIXI.Point(0.5, 0.5);
    this.gameOver.position.x = -500;
    this.gameOver.position.y = -500;
    this.gameOver.scale.x = 0;
    this.gameOver.interactive = true;
    this.gameOver.buttonMode = true;
    this.gameOver.on('pointerdown', this.restart.bind(this));
    this._game.stage.addChild(this.gameOver);
  }

  displayGameOver(dt, currentTime) {
    this.gameOver.position.x = (this._game.renderer.width) / 2;
    if (currentTime < this.endTime) {
      let timeFactor = 1 - ((this.endTime - currentTime) / this.GAMEOVER_ANIMATION_DURATION);
      this.gameOver.position.y = timeFactor * (this._game.renderer.height - this.gameOver.height) / 2;
      this.gameOver.scale.x = timeFactor;
      this.gameOver.scale.y = timeFactor;
      //this.gameOver.rotation = timeFactor * 6 * Math.PI;
    } else {
      this.gameOver.scale.x = 1;
      this.gameOver.scale.y = 1;
      this.gameOver.rotation = 0;
    }
    if (currentTime > this.endTime + this.GAMEOVER_INTERVAL) {
      this.state = -2;
    }
  }

  update(dt, currentTime) {
    // make the ship move a little
    this.count += 0.01;
    if (isNaN(this.hitHighlightStart) === false && currentTime > this.hitHighlightStart + this.HIGHLIGHT_INTERVAL) {
      this._ship.tint = 16777215;
      this.hitHighlightStart = false;
    }
    if (this.state === -1) {
      this.health = 0;
      this.vx = 0;
      this.vy = 0;
      if (!this.gameOver) {
        //add game over sprite if needed
        this.addGameOver(currentTime);
      } else if (!this.gameOverTime){
        //set  game over timing
        this.gameOverTime = currentTime;
        this.endTime = this.gameOverTime + this.GAMEOVER_INTERVAL + this.GAMEOVER_ANIMATION_DURATION;
      } else if (currentTime > this.gameOverTime + this.GAMEOVER_INTERVAL) {
        this.displayGameOver(dt, currentTime);
      }
    } else if (this.state >= 0) {
      this.catchControl(dt, currentTime);
      //update texture for animation of the turn in speed
      if (Math.abs(this.vx) > 0.5) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.horizontal;
      } else if (Math.abs(this.vx) > 0.25) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.a;
      } else if (Math.abs(this.vx) > 0.1) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.b;
      } else {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.vertical;
      }
      //Create the ship from the texture
      this._ship.texture = this.texture;
      if (this.shipColor) {
        this._ship.tint = this.shipColor;
      }
      //make the ship move a little
      this._ship.position.x = this.xOffset;
      this._ship.position.y = this.yOffset;
      this._ship.position.x += Math.sin(this.count * 5) * this.instability;
      this._ship.position.y += Math.cos(this.count * 5) * this.instability;

      if (this.hitbox) {
        this.hitbox.clear();
        this.hitbox.lineStyle(1, 0x0000FF, 1);
        this.hitbox.drawRect(this._ship.x - this._ship.width / 2, this._ship.y - this._ship.height / 2, this._ship.width, this._ship.height);
      }

      this.worldX = this._game.mod((this.worldX + this._game.ship.vx * dt ), this._game.worldWidth);
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
};