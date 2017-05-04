import {rotatePoint} from '../helpers';

export default class Bullet implements IBullet {
  private _position: IPoint;
  private _rotation: number;
  private _velocity: IPoint;
  private _isDeleted: boolean;
  private _date: number;

  constructor({
    position,
    rotation
  }:{
    position: IPoint,
    rotation: number
  }) {
    let posDelta: IPoint = rotatePoint({x: 0, y: -20}, {x: 0, y: 0}, rotation * Math.PI / 180);

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
  }:{
    position?: IPoint,
    rotation?: number,
    velocity?: IPoint
  } = {}): void {
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

  get(): IBullet {
    return {
      position: this.position,
      rotation: this.rotation,
      velocity: this.velocity,
      isDeleted: this.isDeleted,
      date: this.date
    };
  }

  destroy(): void {
    this.isDeleted = true;
  }


  get position(): IPoint {
    return this._position;
  }

  set position(value: IPoint) {
    this._position = value;
  }


  get rotation(): number {
    return this._rotation;
  }

  set rotation(value: number) {
    this._rotation = value;
  }


  get velocity(): IPoint {
    return this._velocity;
  }

  set velocity(value: IPoint) {
    this._velocity = value;
  }


  set isDeleted(value: boolean) {
    this._isDeleted = value;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }


  set date(value: number) {
    this._date = value;
  }

  get date(): number {
    return this._date;
  }
};
