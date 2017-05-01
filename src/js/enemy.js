module.exports = class Enemy {
  constructor(config) {
    this.sprite = config.sprite;
    this.scale = config.scale || 1;
    this.depth = 1;
    this.damage = 10;
    this.randomNumberX = Math.round(10*Math.random());
    this.randomNumberY = Math.round(10*Math.random());
  }

  moveFunction(el, dt, t) {
    return {x: el.randomNumberX+1, y: Math.cos(t / 1000) * 50 + this.randomNumberY * t/1000};
  }
};