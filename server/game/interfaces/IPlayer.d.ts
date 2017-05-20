interface IPlayer {
  id: string;
  login: string;
  ship: IShip;
  keys: IKeys;
  score: number;
  bullets: IBullet[];
}
