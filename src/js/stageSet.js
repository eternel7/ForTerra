const PIXI = require('pixi.js');

module.exports = class StageSet extends PIXI.Graphics {
  /**
   * Creates the game
   *
   * @param   {object} object containing info to determine the stage set
   *
   * @constructor
   */
  constructor(config) {

    // Initialise the PIXI.Graphics
    super();

    // user defined properties
    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.setColor = config.color;
    this.xOffset = config.xOffset || 0;
    this.yOffset = config.yOffset || Math.floor(this.renderer.height / 2);;
    this.depth = config.depth || 0;

    this.lacunarity = 1.5;
    this.persistance = 0.5;
    this.equation = function (x) {
      var y = config.equation(x) +
        Math.pow(this.persistance,1) * config.equation(x*Math.pow(this.lacunarity,2)) +
        Math.pow(this.persistance,2) * config.equation(x*Math.pow(this.lacunarity,4));
      return y;
    };
    this.minX = 0;
    this.maxX = this.renderer.width;
    this.iteration = (this.maxX - this.minX) / 1000;
  }

  draw() {
    this.clear();
    this.xOffset += this.depth;
    this.moveTo(this.minX, this.equation(this.minX + this.xOffset, this.lacunarity, this.persistance) + this.yOffset);
    this.beginFill(this.setColor);
    for (var x = this.minX + this.iteration; x <= this.maxX; x += this.iteration) {
      var y = this.equation(x + this.xOffset, this.lacunarity, this.persistance);
      //console.log(x,y, y + middle);
      this.lineTo(x, y + this.yOffset);
    }
    //last points
    this.lineTo(this.maxX, this.equation(this.maxX + this.xOffset, this.lacunarity, this.persistance) + this.yOffset);
    this.lineTo(this.maxX,this.renderer.height);
    this.lineTo(this.minX,this.renderer.height);
    this.endFill();
    this.stage.addChild(this);
  }
}