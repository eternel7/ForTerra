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
    var groundY = Math.round(2 * this.renderer.height / 3);

    //stars in the sky
    var bgTexture = (config.bg && PIXI.loader.resources[config.bg].texture) || PIXI.loader.resources["background"].texture;
    this.bg = new PIXI.extras.TilingSprite(
      bgTexture,
      this.renderer.width,
      groundY);

    this.backgrounds.push({
      sprite: this.bg,
      depth: 0.01,
      hittingBox: false
    });
    //ground

    //flore on the ground
    var flore = PIXI.loader.resources["floreSpritesheet"];
    var palm = new PIXI.Sprite(flore.textures["palm03.png"]);
    palm.anchor = new PIXI.Point(0.5, 0.5);
    palm.position.x = Math.random() * 500 + 250;
    palm.position.y = groundY;
    this.backgrounds.push({
      sprite: palm,
      depth: 0.15,
      origin: {
        x: palm.position.x,
        y: palm.position.y
      },
      hittingBox: true
    });
    this.stage.addChild(this.sky, this.bg, palm);
  }

  update(dt, t) {
    this.xPlayer += this._game.ship.vx * dt;
    this.yPlayer += this._game.ship.vy * dt;
    for (var i = 0; i < this.backgrounds.length; i++) {
      var el = this.backgrounds[i];
      if (el.sprite instanceof PIXI.extras.TilingSprite) {
        el.sprite.tilePosition.x = 0 - el.depth * this.xPlayer;
        el.sprite.tilePosition.y = 0 - el.depth * this.yPlayer;
      } else {
        if (el.sprite instanceof PIXI.Sprite) {
          el.sprite.position.x = el.origin.x - el.depth * this.xPlayer;
          el.sprite.position.y = el.origin.y - el.depth * this.yPlayer;
        }
      }
      if (el.hittingBox == true) {
        for (var s = 0; s < this._game.spaceShips.length; s++) {
          this._game.spaceShips[s].checkHit(el.sprite.position);
        }
      }
    }
  }
}