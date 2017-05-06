interface IPlayer {
  id: string;
  login: string;
  ship: IShip;
  keys: IKeys;
  bullets: IBullet[];
}
