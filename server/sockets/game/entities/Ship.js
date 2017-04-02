const _ = require('lodash');

const symbolPosition = Symbol('position');
const symbolRotation = Symbol('rotation');
const symbolVelocity = Symbol('velocity');

module.exports = class Ship {
  constructor({position, rotation, velocity} = {}) {
    this[symbolPosition] = position || {
        x: 450,
        y: 300
      };
    this[symbolRotation] = rotation || 0;
    this[symbolVelocity] = velocity || {
        x: 0,
        y: 0
      };
  }

  update({position, rotation, velocity} = {}) {
    if (position) {
      this[symbolPosition] = position;
    }
    if (rotation) {
      this[symbolRotation] = rotation;
    }
    if (velocity) {
      this[symbolVelocity] = velocity;
    }
  }

  get() {
    return { // _.clone necessary for protecting of private Ship data
      position: _.clone(this[symbolPosition]),
      rotation: this[symbolRotation],
      velocity: _.clone(this[symbolVelocity])
    }
  }
};
