const PIXI = require('pixi.js');

module.exports = class Background {

  constructor(config) {
    // user defined properties
    this._game = config.parent;

    this._game.on('update', this.update.bind(this));

    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.setColor = config.color;
    //position of player in the world
    this.xPlayer = config.xPlayer || 0;
    this.yPlayer = config.yPlayer || 0;

    //Static background
    var skies = PIXI.loader.resources["skySpritesheet"].textures;
    this.sky = new PIXI.Sprite(skies["BGSkyBlue4.png"]);

    this.sky.width = this.renderer.width;
    this.sky.height = this.renderer.height * 5;

    //moving backgrounds
    this.backgrounds = [];
    var bgTexture = (config.bg && PIXI.loader.resources[config.bg].texture) || PIXI.loader.resources["background"].texture;
    this.bg = new PIXI.extras.TilingSprite(
      bgTexture,
      this.renderer.width,
      this.renderer.height);

    this.backgrounds.push({
      sprite: this.bg,
      depth: 0.1
    });

    this.stage.addChild(this.sky, this.bg);
  }

  update(dt, t) {
    this.xPlayer += this._game.ship.vx * dt;
    this.yPlayer += this._game.ship.vy * dt;
    for (var i = 0; i < this.backgrounds.length; i++) {
      this.backgrounds[i].sprite.tilePosition.x = 0 - this.backgrounds[i].depth * this.xPlayer;
      this.backgrounds[i].sprite.tilePosition.y = 0 - this.backgrounds[i].depth * this.yPlayer;
    }
  }
}