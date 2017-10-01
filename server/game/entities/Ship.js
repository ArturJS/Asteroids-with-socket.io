// @flow
import type {IPoint} from '../../interfaces/IPoint';
import type {IShip} from '../../interfaces/IShip';

const _ = require('lodash');
const {rotatePoint} = require('../helpers');

module.exports = class Ship implements IShip {
  playerId: string;
  position: IPoint;
  rotation: number;
  velocity: IPoint;

  constructor({
    playerId,
    position,
    rotation,
    velocity
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

  getVertices(): IPoint[] {
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

    vertices.forEach((point: IPoint): void => {
      let {
        x, y
      }: {x: number, y: number} = rotatePoint(point, pos, rotation);
      point.x = x;
      point.y = y;
    });

    return vertices;
  }
};
