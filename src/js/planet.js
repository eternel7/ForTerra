module.exports = class Planet {
  constructor(config) {
    this.scale = Math.random()*0.8+0.2;
  }
  moveFunction(el, dt, t){
      return {x: 0.05, y: 0};
  }
};