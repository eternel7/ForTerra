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
    this.renderer = config.renderer;
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

  draw(stage, color, thickness) {
    var middle = Math.floor(this.renderer.height / 2);
    this.moveTo(this.minX, this.equation(this.minX, this.lacunarity, this.persistance) + middle);
    this.lineStyle(thickness, color);
    console.log(color, thickness);
    for (var x = this.minX + this.iteration; x <= this.maxX; x += this.iteration) {
      var y = this.equation(x, this.lacunarity, this.persistance);
      //console.log(x,y, y + middle);
      this.lineTo(x, y + middle);
    }
    stage.addChild(this);
  }
}