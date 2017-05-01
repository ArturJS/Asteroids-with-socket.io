import * as _ from 'lodash';

const symbolPosition = Symbol('position');
const symbolRotation = Symbol('rotation');
const symbolVelocity = Symbol('velocity');

export default class Ship {
  constructor({
    position = null,
    rotation = null,
    velocity = null
  } = {}) {
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

  update({
    position = null,
    rotation = null,
    velocity = null
  } = {}) {
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
