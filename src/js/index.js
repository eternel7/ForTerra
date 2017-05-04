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
  let myGame = new Game(document.getElementById("container"));
  window.onresize = function(event) {
    myGame.resize(event);
  };
  myGame.resize(0);
}

function onReady() {
  console.log("Ready!!!");
}

PIXI.loader.add([
  {name:"explosionSpriteSheet", url: "static/resources/images/explosions/explosions.json"},
  {name: 'skySpritesheet', url: 'static/resources/images/backgrounds/sky/sky.json'},
  {name: "background", url: "static/resources/images/backgrounds/stars_white.png"},
  {name: "sky", url: "static/resources/images/backgrounds/4.png"},
  {name: 'floreSpritesheet', url: 'static/resources/images/flore/flore.json'},
  {name: "UIBar01", url: "static/resources/images/backgrounds/UIBar01.png"},
  {name: "ships", url: "static/resources/images/ships/wc2ships_sheet.png"},
  {name: "planetsSpritesheet", url: "static/resources/images/space/planets.json"},
  {name: 'bullets', url: 'static/resources/images/shoots/beams.png'},
  {name: 'asteroids', url: 'static/resources/images/space/asteroid_strip64.png'}

])
  .on("progress", loadProgressHandler.bind(this))
  .load(setup)
  .once('complete', onReady.bind(this));