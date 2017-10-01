// @flow
import type {IShip} from './IShip';
import type {IKeys} from './IKeys';
import type {IBullet} from './IBullet';

export interface IPlayer {
  id: string;
  login: string;
  ship: IShip;
  keys: IKeys;
  score: number;
  bullets: IBullet[];
}
