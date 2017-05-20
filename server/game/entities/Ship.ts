import * as _ from 'lodash';
import {rotatePoint} from '../helpers';

export default class Ship implements IShip {
  private _playerId: string;
  private _position: IPoint;
  private _rotation: number;
  private _velocity: IPoint;

  constructor({
    playerId,
    position = null,
    rotation = null,
    velocity = null
  }:{
    playerId: string,
    position?: IPoint,
    rotation?: number,
    velocity?: IPoint
  }) {
    this.playerId = playerId;
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
      playerId: this.playerId,
      position: this.position,
      rotation: this.rotation,
      velocity: this.velocity
    };
  }

  get vertices(): IPoint[] {
    let pos: IPoint = this.position;
    let rotation: number = this.rotation;
    let vertices: IPoint[] = [
      {
        x: pos.x,
        y: pos.y - 15
      },
      {
        x: pos.x - 10,
        y: pos.y + 10
      },
      {
        x: pos.x - 5,
        y: pos.y + 7
      },
      {
        x: pos.x + 5,
        y: pos.y + 7
      },
      {
        x: pos.x + 10,
        y: pos.y + 10
      }
    ];

    _.each(vertices, (point: IPoint): void => {
      let {
        x, y
      }: {x: number, y: number} = rotatePoint(point, pos, rotation);
      point.x = x;
      point.y = y;
    });

    return vertices;
  }

  get playerId(): string {
    return this._playerId;
  }

  set playerId(value: string) {
    this._playerId = value;
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
