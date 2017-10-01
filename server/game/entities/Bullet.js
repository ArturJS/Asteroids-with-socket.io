// @flow
import type {IBullet} from '../../interfaces/IBullet';
import type {IPoint} from '../../interfaces/IPoint';

const {rotatePoint} = require('../helpers');

module.exports = class Bullet implements IBullet {
  playerId: string;
  position: IPoint;
  rotation: number;
  velocity: IPoint;
  isDeleted: boolean;
  date: number;

  constructor({
    playerId,
    position,
    rotation
  }:{
    playerId: string,
    position: IPoint,
    rotation: number
  }) {
    let posDelta: IPoint = rotatePoint({x: 0, y: -20}, {x: 0, y: 0}, rotation * Math.PI / 180);

    this.playerId = playerId;

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

  destroy(): void {
    this.isDeleted = true;
  }
};
