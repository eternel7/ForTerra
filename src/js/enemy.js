module.exports = class Enemy {
  constructor(config) {
    this.sprite = config.sprite;
    this.scale = config.scale || 1;
    this.depth = 1;
    this.damage = 10;
    this.randomNumber = Math.round(10*Math.random());
  }

  moveFunction(el, dt, t) {
    return {x: el.randomNumber, y: Math.cos(t / 1000) * 50 + t/1000};
  }
};