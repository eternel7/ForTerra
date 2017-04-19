const PIXI = require('pixi.js');

module.exports = class Background {

  constructor(config) {
    // user defined properties
    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.ship = config.parent.ship;
    this.setColor = config.color;
    this.xOffset = config.xOffset || 0;
    this.depth = 0.1;

    var bgTexture = (config.bg && PIXI.loader.resources[config.bg].texture) || PIXI.loader.resources["background"].texture;
    this.bg = new PIXI.extras.TilingSprite(
      bgTexture,
      this.renderer.width,
      this.renderer.height);
    var skies = PIXI.loader.resources["skySpritesheet"].textures;

    //Make the sky box using the alias
    this.sky = new PIXI.Sprite(skies["BGSkyBlue4.png"]);

    this.sky.width = this.renderer.width;
    this.sky.height = this.renderer.height * 5;
  }

  update() {
    this.draw();
  }

  draw() {
    this.xOffset += this.depth * this.ship.vx;
    this.bg.tilePosition.x = 0 - this.xOffset;
    this.bg.tilePosition.y = 0;
    this.stage.addChild(this.sky, this.bg);
  }
}