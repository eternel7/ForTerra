const PIXI = require('pixi.js');
const Planet = require('./planet');
const Enemy = require('./enemy');

module.exports = class Background {
  randomProperty(obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
  }
  addStaticSprite(texture){
    let palm = new PIXI.Sprite(texture);
    palm.anchor = new PIXI.Point(0.5, 0.5);
    palm.position.x = Math.random() * this._game.worldWidth;
    palm.position.y = this.ground.equation(palm.position.x) + Math.random() * 100 - 10;
    //draw hitbox for debug
    let hitbox = new PIXI.Graphics();
    hitbox.anchor = new PIXI.Point(0.5, 0.5);
    hitbox.lineStyle(1, 0xa0ee00, 1);
    this.backgrounds.push({
      sprite: palm,
      depth: 1,
      worldX: palm.position.x,
      worldY: palm.position.y,
      hittingBox: {
        sprite: palm,
        rectangle: new PIXI.Rectangle(),
        relativeRectangle: {
          x: 90,
          y: 15,
          w: -190,
          h: -30
        },
      },
      damage: 2
      //hitbox: hitbox
    });
    this.stage.addChild(palm);
  }
  addEnemy(enemy){
    let sprite = new PIXI.Sprite(enemy.sprite);
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.scale.x = enemy.scale;
    sprite.scale.y = enemy.scale;
    sprite.position.x = Math.random() * this._game.worldWidth*0.8;
    sprite.position.y = (this._game.renderer.height - 350)* Math.random() ;
    this.backgrounds.push({
      sprite: sprite,
      depth: 1,
      worldX: sprite.position.x,
      worldY: sprite.position.y,
      hittingBox: {
        sprite: sprite,
        rectangle: new PIXI.Rectangle(),
        relativeRectangle: {
          x: 0,
          y: 0,
          w: 0,
          h: 0
        },
      },
      damage: 20,
      moveFunction: enemy.moveFunction,
      randomNumberX: enemy.randomNumberX,
      randomNumberY: enemy.randomNumberY,
      game: this._game
    });
    this.stage.addChild(sprite);
  }
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
    let bgTexture = (config.bg && PIXI.loader.resources[config.bg].texture) || PIXI.utils.TextureCache["sky"];

    this.bg = new PIXI.extras.TilingSprite(
      bgTexture,
      this.renderer.width,
      this.renderer.height);

    this.backgrounds.push({
      sprite: this.bg,
      depth: 0.01,
      hittingBox: false
    });
    this.stage.addChild(this.sky, this.bg);

    //Add a planet pin point in the sky
    const planets = PIXI.loader.resources["planetsSpritesheet"].textures;
    let planet = new PIXI.Sprite(planets["planet" + Math.round(Math.random() * 20) + ".png"]);
    planet.anchor = new PIXI.Point(0.5, 0.5);
    let planetModel = new Planet();
    planet.scale.x = planetModel.scale;
    planet.scale.y = planetModel.scale;
    planet.position.x = Math.random() * this._game.renderer.width - planet.width;
    planet.position.y = Math.random() * 150 + 300;
    this.backgrounds.push({
      sprite: planet,
      depth: 0.05,
      worldX: planet.position.x,
      worldY: planet.position.y,
      damage: 0,
      moveFunction: planetModel.moveFunction
    });
    this.stage.addChild(planet);

    //World ground
    this.groundSrpite = new PIXI.Graphics();
    this.ground = {
      sprite: this.groundSrpite,
      depth: 1,
      hittingBox: true,
      damage: 50,
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
    this.stage.addChild(this.groundSrpite);

    //Moving sprites : enemies
    for (let i = 0; i <= 10*this._game.worldSizeFactor; i++) {
      let flyingBlock = new Enemy({sprite: PIXI.utils.TextureCache["asteroids"],scale:0.5});
      flyingBlock.sprite.frame = new PIXI.Rectangle(0, 0, 128, 128);
      this.addEnemy(flyingBlock, this.stage);
    }

    //Static sprites
    //Flore on the ground
    const flore = PIXI.loader.resources["floreSpritesheet"].textures;
    var moreFlore = this.randomProperty(flore);
    var lessFlore = this.randomProperty(flore);
    var fewerFlore = this.randomProperty(flore);
    for (let i = 0; i <= 10*this._game.worldSizeFactor; i++) {
      this.addStaticSprite(moreFlore);
    }
    for (let i = 0; i <= 5*this._game.worldSizeFactor; i++) {
      this.addStaticSprite(lessFlore);
    }
    for (let i = 0; i <= 2*this._game.worldSizeFactor; i++) {
      this.addStaticSprite(fewerFlore);
    }
  }

  xStaticSprite(el, dt, t) {
    return this._game.getScreenXof(el, dt, t);
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
        el.sprite.position.x = this.xStaticSprite(el, dt, t);
        el.sprite.position.y = el.worldY - ship.worldY;
        if (el.moveFunction) {
          var relativeMove = el.moveFunction(el, dt, t);
          if (relativeMove && (typeof relativeMove === 'object')) {
            el.sprite.position.x += relativeMove.x;
            el.sprite.position.y += relativeMove.y;
          }
        }
        if (el.hittingBox) {
          let x = el.sprite.x - el.sprite.width / 2;
          let y = el.sprite.y - el.sprite.height / 2;
          let w = el.sprite.width;
          let h = el.sprite.height;
          if (el.hittingBox.relativeRectangle) {
            x += el.hittingBox.relativeRectangle.x;
            y += el.hittingBox.relativeRectangle.y;
            w += el.hittingBox.relativeRectangle.w;
            h += el.hittingBox.relativeRectangle.h;
          }
          el.hittingBox.rectangle.x = x;
          el.hittingBox.rectangle.y = y;
          el.hittingBox.rectangle.width = w;
          el.hittingBox.rectangle.height = h;
          if (el.hitbox) {
            el.hitbox.clear();
            el.hitbox.lineStyle(1, 0xa0ee00, 1);
            el.hitbox.drawRect(x, y, w, h);
          }
        }
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
      if (el.hittingBox) {
        for (let s = 0; s < this._game.spaceShips.length; s++) {
          this._game.spaceShips[s].checkHit(el.hittingBox, el.damage, t);
        }
      }
    }
  }
}