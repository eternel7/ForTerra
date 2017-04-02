const PIXI = require('pixi.js');
const Game = require( './game.js' );

PIXI.loader
  .add("background","static/resources/backgrounds/starry_night_sky.jpg")
//  .add("background","static/resources/backgrounds/blue_sky.jpg")
//  .add("background","static/resources/backgrounds/landscape.svg")
  .add("planes","static/resources/ships/planes_left.png")
  .load(setup);

function setup() {
  new Game(document.body);
}