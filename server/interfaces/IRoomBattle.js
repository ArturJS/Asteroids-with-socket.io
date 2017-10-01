// @flow
import type {IPlayer} from './IPlayer';
import type {IAsteroid} from './IAsteroid';
import type {IExplosion} from './IExplosion';

export interface IRoomBattle {
  id: string;
  players: Map<string, IPlayer>;
  asteroids: IAsteroid[];
  explosions: IExplosion[]
}
