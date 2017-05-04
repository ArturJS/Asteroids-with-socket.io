export default class Ship implements IShip {
  private _position: IPoint;
  private _rotation: number;
  private _velocity: IPoint;

  constructor({
    position = null,
    rotation = null,
    velocity = null
  }:{
    position?: IPoint,
    rotation?: number,
    velocity?: IPoint
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

  get(): IShip {
    return {
      position: this.position,
      rotation: this.rotation,
      velocity: this.velocity
    };
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
};
