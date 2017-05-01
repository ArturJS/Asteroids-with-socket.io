import * as _ from 'lodash';

export default class Bullet {
  private _position;
  private _rotation;
  private _velocity;
  private _isDeleted;
  private _date;

  constructor({
    position = null,
    rotation = null
  } = {}) {
    let posDelta = _rotatePoint({x: 0, y: -20}, {x: 0, y: 0}, rotation * Math.PI / 180);

    this.position = {
      x: position.x + posDelta.x,
      y: position.y + posDelta.y
    };
    this.rotation = rotation;
    this.velocity = {
      x: posDelta.x / 2,
      y: posDelta.y / 2
    };
    this.isDeleted = false;
    this.date = Date.now();
  }

  update({
    position = null,
    rotation = null,
    velocity = null
  } = {}) {
    if (position) {
      this.position = position;
    }
    if (rotation) {
      this.rotation = rotation;
    }
    if (velocity) {
      this.velocity = velocity;
    }
  }

  get() {
    return {
      position: this.position,
      rotation: this.rotation,
      velocity: this.velocity
    }
  }

  destroy(){
    this.isDeleted = true;
  }

  get shotDate() {
    return this.date;
  }

  get position() {
    return _.clone(this._position);
  }

  set position(value) {
    this._position = _.clone(value);
  }

  get rotation() {
    return this._rotation;
  }

  set rotation(value) {
    this._rotation = value;
  }

  get velocity() {
    return  _.clone(this._velocity);
  }

  set velocity(value) {
    this._velocity = _.clone(value);
  }

  set isDeleted(value) {
    this._isDeleted = value;
  }

  get isDeleted() {
    return this._isDeleted;
  }

  set date(value) {
    this._date = value;
  }

  get date() {
    return this._date;
  }
};

// private methods

function _rotatePoint(p, center, angle) {
  return {
    x: ((p.x - center.x) * Math.cos(angle) - (p.y - center.y) * Math.sin(angle)) + center.x,
    y: ((p.x - center.x) * Math.sin(angle) + (p.y - center.y) * Math.cos(angle)) + center.y
  };
}
