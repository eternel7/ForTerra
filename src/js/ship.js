const PIXI = require('pixi.js');
const control = require('./controls');

module.exports = class Ship {

  constructor(config) {

    // user defined properties
    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.shipColor = config.color || false;
    this.count = 0;
    this.xOffset = config.xOffset || 250;
    this.yOffset = config.yOffset || Math.floor(this.renderer.height / 3);
    this.depth = 1;
    this.acceleration = 0.1;
    this.dx = 5;
    this.dy = 5;

    // container
    this._container = new PIXI.Container();
    this._container.position.x = this.xOffset;
    this._container.position.y = this.yOffset;


    this.texture = (config.texture || PIXI.utils.TextureCache["ships"]);


    //Create a rectangle object that defines the position and
    //size of the sub-image you want to extract from the texture
    var rectangle = new PIXI.Rectangle(1734, 1408, 122, 52);

    //Tell the texture to use that rectangular section
    this.texture.frame = rectangle;

    //Create the ship from the texture
    this._ship = new PIXI.Sprite(this.texture);
    //Face right
    this._ship.scale.x = -1;

    if (this.shipColor) {
      this._ship.tint = this.shipColor;
    }

    // create a random instability for the ship between 1 - 5
    this.instability = (1 + Math.random() * 5);

    // create a random speed for the ship between 1 - 3
    this.vx = Math.random() * 2 + 1;
    this.vy = Math.random() * 2 + 1;
  }

  accelerateX(more){
    if(more===true){
      this.xOffset += this.dx;
      this.vx += this.acceleration;
    } else {
      this.xOffset -= this.dx;
      this.vx -= this.acceleration;
    }
  }

  accelerateY(more){
    if(more===true){
      this.yOffset += this.dy;
      this.vy += this.acceleration;
    } else {
      this.yOffset -= this.dy;
      this.vy -= this.acceleration;
    }
  }

  update() {
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

  roundPrec(num, dec) {
    var precise = Math.pow(10, dec);
    return Math.round(num * precise) / precise;
  }

  draw() {
    var ship = this._ship;
    ship.x = this.xOffset;
    ship.y = this.yOffset;
    //make the ship move a little
    ship.x += Math.sin( this.count * 5) * this.instability + this.vx;
    ship.y += Math.cos( this.count * 3) * this.instability ;
    var debugText = new PIXI.Text(
      this.roundPrec(this.instability,2) + " - (x: " + this.roundPrec(ship.x,0) + " y: " + this.roundPrec(ship.y,0)+")" +
      " - (vx: " + this.roundPrec(this.vx,2) + " vy: " + this.roundPrec(this.vy,2)+")",
      {
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#efefef',
        align: 'left'
      });
    debugText.x = this._ship.x - 140;
    debugText.y = this._ship.y + 60;
    this.stage.addChild(this._ship, debugText);
  }
}