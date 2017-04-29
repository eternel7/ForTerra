const PIXI = require('pixi.js');

module.exports = class Background {

  constructor(config) {
    // user defined properties
    this._game = config.parent;

    this._game.on('update', this.update.bind(this));

    this.stage = config.parent.stage;
    this.renderer = config.parent.renderer;
    this.setColor = config.color;

    //Static background
    let skies = PIXI.loader.resources["skySpritesheet"].textures;
    this.sky = new PIXI.Sprite(skies["BGSkyBlue4.png"]);

    this.sky.width = this.renderer.width;
    this.sky.height = this.renderer.height * 5;

    //moving backgrounds
    this.backgrounds = [];
    let groundY = this.renderer.height;

    //stars in the sky
    let bgTexture = (config.bg && PIXI.loader.resources[config.bg].texture) || PIXI.loader.resources["background"].texture;
    this.bg = new PIXI.extras.TilingSprite(
      bgTexture,
      this.renderer.width,
      this.renderer.height);

    this.backgrounds.push({
      sprite: this.bg,
      depth: 0.01,
      hittingBox: false
    });

    //World ground
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
      color: 0xaca31e
    };

    this.backgrounds.push(this.ground);
    this.stage.addChild(this.sky, this.bg, this.groundSrpite);

    //Static sprites
    //Flore on the ground
    const flore = PIXI.loader.resources["floreSpritesheet"];
    for (let i = 0; i <= 50; i++) {
      let palm = new PIXI.Sprite(flore.textures["palm03.png"]);
      palm.anchor = new PIXI.Point(0.5, 0.5);
      palm.position.x = Math.random() * this._game.worldWidth;
      palm.position.y = this.ground.equation(palm.position.x) + Math.random() * 100 - 10;
      this.backgrounds.push({
        sprite: palm,
        depth: 1,
        worldX: palm.position.x,
        worldY: palm.position.y,
        hittingBox: true,
        damage: 2
      });
      this.stage.addChild(palm);
    }
  }

  xStaticSprite(el) {
    return this._game.getScreenXof(el);
  }

  update(dt, t) {
    const ship = this._game.ship;
    let minX = 0;
    let maxX = this._game.renderer.width;
    //var worldRange = this._game.getScreenWorldRange();
    for (let i = 0; i < this.backgrounds.length; i++) {
      let el = this.backgrounds[i];
      if (el.sprite instanceof PIXI.extras.TilingSprite) {
        el.sprite.tilePosition.x -= el.depth * ship.vx * dt;
        el.sprite.tilePosition.y = 0 - el.depth * ship.worldY;
      } else if (el.sprite instanceof PIXI.Sprite) {
        el.sprite.position.x = this.xStaticSprite(el);
        el.sprite.position.y = el.worldY - el.depth * ship.worldY;
      } else if (el.sprite instanceof PIXI.Graphics) {
        el.sprite.clear();
        el.sprite.moveTo(minX, el.equation(minX + ship.worldX * el.depth) - ship.worldY * el.depth);
        el.sprite.beginFill(el.color);
        let iteration = (maxX - minX) / 1000;
        for (let x = minX + iteration; x <= maxX; x += iteration) {
          let y = el.equation(x + ship.worldX * el.depth);
          el.sprite.lineTo(x, y - ship.worldY * el.depth);
        }
        //last points
        el.sprite.lineTo(maxX, el.equation(maxX + ship.worldX * el.depth) - ship.worldY * el.depth);
        el.sprite.lineTo(maxX, this._game.renderer.height);
        el.sprite.lineTo(minX, this._game.renderer.height);
        el.sprite.endFill();
      }
      if (el.hittingBox === true) {
        for (let s = 0; s < this._game.spaceShips.length; s++) {
          this._game.spaceShips[s].checkHit(el.sprite, el.damage);
        }
      }
    }
  }
}