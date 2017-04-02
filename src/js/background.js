const PIXI = require('pixi.js');

module.exports = class Background {

  constructor(config) {
    // user defined properties
    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.setColor = config.color;
    this.xOffset = config.xOffset || 0;
    this.depth = 0.1;
    var bgTexture = (config.bg && PIXI.loader.resources[config.bg].texture) || PIXI.loader.resources["background"].texture;
    this.bg = new PIXI.extras.TilingSprite(
      bgTexture,
      Math.max(this.renderer.width,bgTexture.baseTexture.width),
      Math.max(this.renderer.height,bgTexture.baseTexture.height)
    );
  }

  draw() {
    this.xOffset += this.depth;
    this.bg.tilePosition.x = 0 - this.xOffset;
    this.bg.tilePosition.y = 0;
    this.stage.addChild(this.bg);
  }
}