import * as _ from 'lodash';

export default class Ship {
  private _position;
  private _rotation;
  private _velocity;

  constructor({
    position = null,
    rotation = null,
    velocity = null
  } = {}) {
    this.position = position || {
        x: 450,
        y: 300
      };
    this.rotation = rotation || 0;
    this.velocity = velocity || {
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

  get position() {
    return  _.clone(this._position);
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
};
