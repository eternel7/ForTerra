const PIXI = require('pixi.js');
const control = require('./controls');

module.exports = class Ship {

  constructor(config) {

    // user defined properties
    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.shipColor = config.color || false;
    this.count = 0;
    this.xOffset = config.xOffset || Math.floor(this.renderer.width / 2);
    this.yOffset = config.yOffset || Math.floor(this.renderer.height / 3);
    this.depth = 1;
    this.acceleration = 0.1;
    this.maxSpeed = 30;
    this.dx = 5;
    this.dy = 5;

    //ship size and position in sprite sheet
    this.spriteX = 1734;
    this.spriteY = 1408;
    this.spriteW = 122;
    this.spriteH = 52;

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

    // container
    this._container = new PIXI.Container();
    this._container.position.x = this.xOffset;
    this._container.position.y = this.yOffset;


    this.texture = (config.texture || PIXI.utils.TextureCache["ships"]);

    //Create a rectangle object that defines the position and
    //size of the sub-image you want to extract from the texture
    this.Rect = {};
    for(var pos in this.sprites){
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

    if (this.shipColor) {
      this._ship.tint = this.shipColor;
    }

    // create a random instability for the ship between 1 - 5
    this.instability = (1 + Math.random() * 5);

    // create a random speed for the ship between 1 - 3
    this.vx = 0;
    this.vy = Math.random() * 2 + 1;
  }

  accelerateX(more) {
    //manage ship speed and position
    var posMargin = 2 * this.instability;
    if (more === true) {
      this.xOffset = Math.min(this.xOffset + this.dx, this.renderer.width - posMargin - 2*this.sprites.horizontal.w);
      this.vx = Math.min(this.vx + this.acceleration, this.maxSpeed);
    } else {
      this.xOffset = Math.max(this.xOffset - this.dy, posMargin + 2*this.sprites.horizontal.w);
      this.vx = Math.max(this.vx - this.acceleration, -1 * this.maxSpeed);
    }
  }

  accelerateY(more) {
    if (more === true) {
      this.yOffset = Math.min(this.yOffset + this.dy, this.renderer.height - this.sprites.horizontal.h);
    } else {
      this.yOffset = Math.max(this.yOffset - this.dy, 0);
    }
  }

  catchControl(){
    //Capture the keyboard arrow keys
    if (control.isDown(control.UP)) {
      this.accelerateY(false);
    }
    if (control.isDown(control.LEFT)) {
      this.accelerateX(false);
    }
    if (control.isDown(control.DOWN)) {
      this.accelerateY(true);
    }
    if (control.isDown(control.RIGHT)) {
      this.accelerateX(true);
    }
  }

  update() {
    this.catchControl();
    //update texture for animation of the turn in speed
    if(Math.abs(this.vx)>3){
      //Tell the texture to use that rectangular section
      this.texture.frame = this.Rect.horizontal;
    } else if(Math.abs(this.vx)>2){
      //Tell the texture to use that rectangular section
      this.texture.frame = this.Rect.a;

    } else if(Math.abs(this.vx)>1){
      //Tell the texture to use that rectangular section
      this.texture.frame = this.Rect.b;

    }else if(Math.abs(this.vx)>=0){
      //Tell the texture to use that rectangular section
      this.texture.frame = this.Rect.vertical;
    }
    //Create the ship from the texture
    this._ship = new PIXI.Sprite(this.texture);

    //ship orientation
    this._ship.anchor = new PIXI.Point(0.5, 0.5);
    if (this.vx < 0 && this._ship.scale.x < 0) {
      this._ship.scale.x = 1;
    } else {
      if (this.vx >= 0 && this._ship.scale.x > 0) {
        this._ship.scale.x = -1;
      }
    }
  }

  roundPrec(num, dec) {
    var precise = Math.pow(10, dec);
    return Math.round(num * precise) / precise;
  }

  draw() {
    var ship = this._ship;
    ship.x = this.xOffset;
    ship.y = this.yOffset;
    //make the ship move a little
    ship.x += Math.sin(this.count * 5) * this.instability + this.vx;
    ship.y += Math.cos(this.count * 3) * this.instability;
    var debugText = new PIXI.Text(
      this.roundPrec(this.instability, 2) + " - (vx: " + this.roundPrec(this.vx, 2) + ")",
      {
        fontWeight: 'bold',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#efefef',
        align: 'left'
      });
    debugText.x = this._ship.x - 140;
    debugText.y = this._ship.y + 60;
    this.stage.addChild(this._ship);
  }
}