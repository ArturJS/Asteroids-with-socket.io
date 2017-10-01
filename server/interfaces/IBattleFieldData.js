// @flow
import type {IPlayer} from './IPlayer';
import type {IPoint} from './IPoint';
import type {IExplosion} from './IExplosion';
import type {IKeys} from './IKeys';
import type {IShip} from './IShip';

export interface IBattleFieldData {
  players:IPlayerDTO[];
  asteroids:{vertices:IPoint[]}[];
  explosions: IExplosion[];
}

interface IPlayerDTO {
  id: string;
  login: string;
  ship: IShip;
  keys: IKeys;
  score: number;
  bullets: IBulletDTO[];
}

interface IBulletDTO {
  playerId: string;
  position: IPoint;
  rotation: number;
  velocity: IPoint;
  isDeleted: boolean;
  date: number;
}
