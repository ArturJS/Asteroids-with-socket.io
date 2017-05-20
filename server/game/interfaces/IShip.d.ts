interface IShip {
  playerId: string;
  position: IPoint;
  rotation: number;
  velocity: IPoint;
  readonly vertices?: IPoint[];
}
