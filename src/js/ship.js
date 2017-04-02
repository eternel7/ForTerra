const PIXI = require('pixi.js');

module.exports = class Background {

  constructor(config) {
    // user defined properties
    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.setColor = config.color;
    this.xOffset = config.xOffset || 0;
    this.depth = 1;
    this.texture = (config.texture && TextureCache["images/tileset.png"]);
  }

  draw() {
    this.xOffset += this.depth;
    this.bg.tilePosition.x = 0 - this.xOffset;
    this.bg.tilePosition.y = 0;
    this.stage.addChild(this.bg);
  }
}