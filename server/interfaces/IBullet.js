// @flow
import type {IPoint} from './IPoint';

export interface IBullet {
  playerId: string;
  position: IPoint;
  rotation: number;
  velocity: IPoint;
  isDeleted: boolean;
  date: number;
  destroy(): void;
}
