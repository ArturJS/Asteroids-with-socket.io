// @flow
import type {IPoint} from './IPoint';

export interface IShip {
  playerId: string;
  position: IPoint;
  rotation: number;
  velocity: IPoint;
}
