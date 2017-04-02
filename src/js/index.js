const PIXI = require('pixi.js');
const Game = require( './game.js' );

PIXI.loader
  .add("background","resources/backgrounds/starry_night_sky.jpg")
//  .add("background","resources/backgrounds/blue_sky.jpg")
//  .add("background","resources/backgrounds/landscape.svg")
  .add("planes","resources/ships/planes_left.png")
  .load(setup);

function setup() {
  new Game(document.body);
}