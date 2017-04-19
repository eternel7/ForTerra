const PIXI = require('pixi.js');
const control = require('./controls');
const Bump = require('./collision');
const bump = new Bump();

module.exports = class Ship {

  roundPrec(num, dec) {
    var precise = Math.pow(10, dec);
    return Math.round(num * precise) / precise;
  }

  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  constructor(config) {

    // user defined properties
    this._game = config.parent;

    this._game.on( 'update', this.update.bind( this ) );

    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.shipColor = config.color || false;
    this.count = 0;
    this.xOffset = config.xOffset || Math.floor(this.renderer.width / 2);
    this.yOffset = config.yOffset || Math.floor(this.renderer.height / 4);
    this.depth = 1;
    this.MAX_HEALTH = this.health = config.health || 100;
    this.acceleration = 2 / 100;
    this.maxSpeed = 30;
    this.dx = 5 / 20;
    this.dy = 5 / 20;

    this.state = 1; // -1 boom - 1 start - other number for other animations
    this._timeLastBulletFired = 0;
    // Time that passes between shots
    this.FIRE_INTERVAL = 500;

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

    //Text
    this.textStyle = { fontSize: 14, fontFamily: 'Arial', fill: 'rgb(0,255,0)', align : 'center' };
    this.text = new PIXI.Text( "My Ship", this.textStyle );
    this.text.x = 5;
    this.text.y = 5;

    //Create the ship from the texture
    this._ship = new PIXI.Sprite(this.texture);
    this._ship.anchor = new PIXI.Point(0.5, 0.5);

    if (this.shipColor) {
      this._ship.tint = this.shipColor;
    }

    //manage explosion animation
    this.explosions = [];
    this.explosionSteps = 31;
    for (var i = 0; i <= this.explosionSteps; i++) {
      this.explosions.push(new PIXI.Sprite(PIXI.utils.TextureCache["explosion" + this.pad(i, 2, '0')]));
    }
    // create a random instability for the ship between 1 - 5
    this.instability = (1 + Math.random() * 5);

    // create a random speed for the ship between 1 - 3
    this.vx = 0;
    this.vy = Math.random() * 2 + 1;
  }

  updateTextStyle(){
    var f = ( this.health / this.MAX_HEALTH );
    var g = Math.floor(f * 255);
    var r = Math.floor( ( 1 - f ) * 255 );

    this.textStyle.fill = `rgb(${r}, ${g}, 0)`;
    this.text.style = this.textStyle;
  }

  /**
   * Check if the spaceship was hit by a bullet
   *
   * @param   {PIXI.Point} bulletPosition
   *
   * @public
   * @returns {Boolean} wasHit
   */
  checkHit( bulletPosition ) {
    if( this._ship.containsPoint( bulletPosition ) ) {
      // Ok, we're hit. Flash red
      this._ship.tint = 0xFF0000;
      this.hitHighlightStart = performance.now();

      // Remove decrement health by 1
      this.health--;

      if( this.health <= 0 ) {
        // oh dear, we're dead
        this.state=-1;
      } else {
        // still alive, but taken some damage. Update text color from green to red
        this.updateTextStyle();
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
      this.vx = Math.min(this.vx + this.acceleration * dt, this.maxSpeed);
    } else {
      this.xOffset = Math.max(this.xOffset - this.dy * dt, posMargin + 2 * this.sprites.horizontal.w);
      this.vx = Math.max(this.vx - this.acceleration * dt, -1 * this.maxSpeed);
    }
  }

  accelerateY(more, dt, t) {
    if (more === true) {
      this.yOffset = Math.min(this.yOffset + this.dy * dt, this.renderer.height - this.sprites.horizontal.h);
    } else {
      this.yOffset = Math.max(this.yOffset - this.dy * dt, 0);
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
      if(currentTime > this._timeLastBulletFired + this.FIRE_INTERVAL ) {
        //shooting a bullet
        this._game.bulletManager.add(this._ship.x, this._ship.y, this.vx, this._ship);
        this._timeLastBulletFired = currentTime;
      }
    }
  }

  testCollision() {
    var ship = this._ship;
    var ground = this._game.ground;
    //search of ground y min and y max
    var rectX = Math.round(ship.x - this.texture.frame.width / 2);
    var yg1 = ground.equation(rectX + ground.xOffset);
    var yg2 = ground.equation(rectX + this.texture.frame.width + ground.xOffset);
    var groundY = Math.max(yg1, yg2);
    var groundH = groundY - Math.min(yg1, yg2);
    var groundRect = new PIXI.Rectangle(rectX,
      groundY + ground.yOffset - groundH,
      this.texture.frame.width,
      groundH);
    var shipRect = new PIXI.Rectangle(rectX,
      Math.round(ship.y - this.texture.frame.height / 2),
      this.texture.frame.width,
      this.texture.frame.height);
    return bump.hitTestRectangle(shipRect, groundRect);
  }

  updateExplosion() {
    if(this.vx!=0){
      var direction = Math.round(Math.abs(this.vx)/this.vx);
      this.vx = direction * Math.max(0, Math.abs(this.vx) - 1 * this.acceleration*100);
    }
    //this.xOffset = Math.max( Math.floor(this.renderer.width / 2), this.xOffset - 1);
  }

  drawExplosion(dt,t) {
    var ship = this._ship;
    var explosionSpeed = 4;
    var explosionStep = Math.floor((this.stateStep*explosionSpeed)/dt) + 1;
    if (explosionStep <= this.explosionSteps) {
      this._ship = this.explosions[explosionStep];
      this._ship.anchor = new PIXI.Point(0.5, 0.5);
      var ground = this._game.ground;
      ship.y = Math.max(ship.y - 1, ground.equation(ship.x + ground.xOffset) + ground.yOffset);
    } else {
      this._ship = this.explosions[this.explosionSteps];
      this._ship.anchor = new PIXI.Point(0.5, 0.5);
    }
  }

  updateState() {
    //test collision
    if (this.state != -1 && this.testCollision()) {
      this.state = -1;
      this.stateStep = 0;
    }
    this.stateStep = this.stateStep + 1 || 0;
  }

  update(dt, t) {
    // make the ship move a little
    this.count += 0.01;

    this.updateState();

    if (this.state == -1) {
      this.health--;
      this.updateTextStyle();
      this.updateExplosion();
    } else {
      this.catchControl(dt, t);
      //update texture for animation of the turn in speed
      if (Math.abs(this.vx) > 2.5) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.horizontal;
      } else if (Math.abs(this.vx) > 1.5) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.a;
      } else if (Math.abs(this.vx) > 0.5) {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.b;
      } else {
        //Tell the texture to use that rectangular section
        this.texture.frame = this.Rect.vertical;
      }
      //Create the ship from the texture
      this._ship = new PIXI.Sprite(this.texture);
      this._ship.anchor = new PIXI.Point(0.5, 0.5);

      //ship orientation
      if (this.vx < 0 && this._ship.scale.x < 0) {
        this._ship.scale.x = 1;
      } else {
        if (this.vx >= 0 && this._ship.scale.x > 0) {
          this._ship.scale.x = -1;
        }
      }
    }
    this.draw(dt,t);
  }

  draw(dt,t) {
    var ship = this._ship;
    ship.x = this.xOffset;
    ship.y = this.yOffset;
    if (this.state == -1) {
      this.drawExplosion(dt,t);
    } else if (this.state != -1) {
      if (this.shipColor) {
        ship.tint = this.shipColor;
      }
      //make the ship move a little
      ship.x += Math.sin(this.count * 5) * this.instability + this.vx;
      ship.y += Math.cos(this.count * 3) * this.instability;
    }
    var debugText = new PIXI.Text(
      this.roundPrec(this.instability, 2) + " - (vx: " + this.roundPrec(this.vx, 2) + ")",
      {
        fontWeight: 'bold',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#efefef',
        align: 'left'
      });
    debugText.x = ship.x - 140;
    debugText.y = ship.y + 60;
    this.stage.addChild(ship,this.text);
  }
}