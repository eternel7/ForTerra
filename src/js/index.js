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

function onReady(){
  console.log("Ready!!!");
}

PIXI.loader.add([
  {name: 'skySpritesheet', url: 'static/resources/images/backgrounds/sky/sky.json'},
  {name: "background", url: "static/resources/images/backgrounds/stars_white.png"},
  {name: "ships", url: "static/resources/images/ships/wc2ships_sheet.png"},
  {name: 'explosionSpritesheet', url: 'static/resources/images/shoots/explosion.json'}])
  .on("progress", loadProgressHandler.bind(this))
  .load(setup)
  .once('complete', onReady.bind(this));