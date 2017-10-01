// @flow
import type {IPoint} from './IPoint';

export interface IAsteroid {
  id: string;
  velocity: IPoint;
  isDeleted: boolean;
  vertices: IPoint[];
  radius: number;
  rotationSpeed: number;
  getCenter(): IPoint;
  destroy(): IAsteroid[]
}
