import * as _ from 'lodash';

const symbolPosition = Symbol('position');
const symbolRotation = Symbol('rotation');
const symbolVelocity = Symbol('velocity');
const symbolIsDeleted = Symbol('isDeleted');
const symbolDate = Symbol('symbolDate');

export default class Bullet {
  constructor({
    position = null,
    rotation = null
  } = {}) {
    let posDelta = _rotatePoint({x: 0, y: -20}, {x: 0, y: 0}, rotation * Math.PI / 180);

    this[symbolPosition] = {
      x: position.x + posDelta.x,
      y: position.y + posDelta.y
    };
    this[symbolRotation] = rotation;
    this[symbolVelocity] = {
      x: posDelta.x / 2,
      y: posDelta.y / 2
    };
    this[symbolIsDeleted] = false;
    this[symbolDate] = Date.now();
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

  destroy(){
    this[symbolIsDeleted] = true;
  }

  get isDeleted() {
    return this[symbolIsDeleted];
  }

  get shotDate() {
    return this[symbolDate];
  }
};

// private methods

function _rotatePoint(p, center, angle) {
  return {
    x: ((p.x - center.x) * Math.cos(angle) - (p.y - center.y) * Math.sin(angle)) + center.x,
    y: ((p.x - center.x) * Math.sin(angle) + (p.y - center.y) * Math.cos(angle)) + center.y
  };
}
