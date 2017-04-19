const PIXI = require('pixi.js');
const Game = require('./game.js');

function loadProgressHandler(loader, resource) {

  //Display the file `url` currently being loaded
  //console.log("loading: " + resource.url);
  console.log("loading: " + resource.name);

  //Display the percentage of files currently loaded
  console.log("progress: " + Math.floor(loader.progress) + "%");

}

function setup() {
  new Game(document.body);
}

function onReady() {
  console.log("Ready!!!");
}

PIXI.loader.add([
  {name: 'skySpritesheet', url: 'static/resources/images/backgrounds/sky/sky.json'},
  {name: "background", url: "static/resources/images/backgrounds/stars_white.png"},
  {name: "ships", url: "static/resources/images/ships/wc2ships_sheet.png"},
  {name: 'explosion01', url: 'static/resources/images/explosions/images/explosion/expl_06_0000.png'},
  {name: 'explosion02', url: 'static/resources/images/explosions/images/explosion/expl_06_0001.png'},
  {name: 'explosion03', url: 'static/resources/images/explosions/images/explosion/expl_06_0002.png'},
  {name: 'explosion04', url: 'static/resources/images/explosions/images/explosion/expl_06_0003.png'},
  {name: 'explosion05', url: 'static/resources/images/explosions/images/explosion/expl_06_0004.png'},
  {name: 'explosion06', url: 'static/resources/images/explosions/images/explosion/expl_06_0005.png'},
  {name: 'explosion07', url: 'static/resources/images/explosions/images/explosion/expl_06_0006.png'},
  {name: 'explosion08', url: 'static/resources/images/explosions/images/explosion/expl_06_0007.png'},
  {name: 'explosion09', url: 'static/resources/images/explosions/images/explosion/expl_06_0008.png'},
  {name: 'explosion10', url: 'static/resources/images/explosions/images/explosion/expl_06_0009.png'},
  {name: 'explosion11', url: 'static/resources/images/explosions/images/explosion/expl_06_0010.png'},
  {name: 'explosion12', url: 'static/resources/images/explosions/images/explosion/expl_06_0011.png'},
  {name: 'explosion13', url: 'static/resources/images/explosions/images/explosion/expl_06_0012.png'},
  {name: 'explosion14', url: 'static/resources/images/explosions/images/explosion/expl_06_0013.png'},
  {name: 'explosion15', url: 'static/resources/images/explosions/images/explosion/expl_06_0014.png'},
  {name: 'explosion16', url: 'static/resources/images/explosions/images/explosion/expl_06_0015.png'},
  {name: 'explosion17', url: 'static/resources/images/explosions/images/explosion/expl_06_0016.png'},
  {name: 'explosion18', url: 'static/resources/images/explosions/images/explosion/expl_06_0017.png'},
  {name: 'explosion19', url: 'static/resources/images/explosions/images/explosion/expl_06_0018.png'},
  {name: 'explosion20', url: 'static/resources/images/explosions/images/explosion/expl_06_0019.png'},
  {name: 'explosion21', url: 'static/resources/images/explosions/images/explosion/expl_06_0020.png'},
  {name: 'explosion22', url: 'static/resources/images/explosions/images/explosion/expl_06_0021.png'},
  {name: 'explosion23', url: 'static/resources/images/explosions/images/explosion/expl_06_0022.png'},
  {name: 'explosion24', url: 'static/resources/images/explosions/images/explosion/expl_06_0023.png'},
  {name: 'explosion25', url: 'static/resources/images/explosions/images/explosion/expl_06_0024.png'},
  {name: 'explosion26', url: 'static/resources/images/explosions/images/explosion/expl_06_0025.png'},
  {name: 'explosion27', url: 'static/resources/images/explosions/images/explosion/expl_06_0026.png'},
  {name: 'explosion28', url: 'static/resources/images/explosions/images/explosion/expl_06_0027.png'},
  {name: 'explosion29', url: 'static/resources/images/explosions/images/explosion/expl_06_0028.png'},
  {name: 'explosion30', url: 'static/resources/images/explosions/images/explosion/expl_06_0029.png'},
  {name: 'explosion31', url: 'static/resources/images/explosions/images/explosion/expl_06_0030.png'},
  {name: 'explosion32', url: 'static/resources/images/explosions/images/explosion/expl_06_0031.png'},
  {name: 'bullets', url: 'static/resources/images/shoots/beams.png'}
])
  .on("progress", loadProgressHandler.bind(this))
  .load(setup)
  .once('complete', onReady.bind(this));