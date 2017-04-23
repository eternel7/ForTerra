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
    var groundY = Math.round(3 * this.renderer.height / 4);

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

    //TODO : add a ground
    this.groundSrpite = new PIXI.Graphics();
    this.ground = {
      sprite: this.groundSrpite,
      depth: 1,
      hittingBox: true,
      damage: 20,
      subEquation: function (x) {
        return 2 * Math.sin(x / 20) + 5 * Math.cos(x / 50);
      },
      equation: function (x) {
        return this.subEquation(x) +
          0.5 * this.subEquation(2 * x) +
          0.25 * this.subEquation(4 * x) + groundY;
      },
      color: 0x116611
    };

    this.backgrounds.push(this.ground);
    this.stage.addChild(this.sky, this.bg, this.groundSrpite);
    //flore on the ground
    var flore = PIXI.loader.resources["floreSpritesheet"];
    for (var i = 0; i <= 100; i++) {
      var palm = new PIXI.Sprite(flore.textures["palm03.png"]);
      palm.anchor = new PIXI.Point(0.5, 0.5);
      palm.position.x = Math.random()*10000;
      palm.position.y = this.ground.equation(palm.position.x) + Math.random()*30-10;
      this.backgrounds.push({
        sprite: palm,
        depth: 1,
        origin: {
          x: palm.position.x,
          y: palm.position.y
        },
        hittingBox: true,
        damage: 5
      });
      this.stage.addChild(palm);
    }
  }

  update(dt, t) {
    this.xPlayer += this._game.ship.vx * dt;
    this.yPlayer += this._game.ship.vy * dt;
    for (var i = 0; i < this.backgrounds.length; i++) {
      var el = this.backgrounds[i];
      if (el.sprite instanceof PIXI.extras.TilingSprite) {
        el.sprite.tilePosition.x = 0 - el.depth * this.xPlayer;
        el.sprite.tilePosition.y = 0 - el.depth * this.yPlayer;
      } else if (el.sprite instanceof PIXI.Sprite) {
        el.sprite.position.x = el.origin.x - el.depth * this.xPlayer;
        el.sprite.position.y = el.origin.y - el.depth * this.yPlayer;
      } else if (el.sprite instanceof PIXI.Graphics) {
        var minX = 0;
        var maxX = this._game.renderer.width;
        var iteration = (maxX - minX) / 1000;
        el.sprite.clear();
        el.sprite.moveTo(minX, el.equation(minX + this.xPlayer * el.depth) - this.yPlayer * el.depth);
        el.sprite.beginFill(el.color);
        for (var x = minX + iteration; x <= maxX; x += iteration) {
          var y = el.equation(x + this.xPlayer * el.depth);
          el.sprite.lineTo(x, y - this.yPlayer * el.depth);
        }
        //last points
        el.sprite.lineTo(maxX, el.equation(maxX + this.xPlayer * el.depth) - this.yPlayer * el.depth);
        el.sprite.lineTo(maxX, this._game.renderer.height);
        el.sprite.lineTo(minX, this._game.renderer.height);
        el.sprite.endFill();
      }
      if (el.hittingBox == true) {
        for (var s = 0; s < this._game.spaceShips.length; s++) {
          this._game.spaceShips[s].checkHit(el.sprite, el.damage);
        }
      }
    }
  }
}