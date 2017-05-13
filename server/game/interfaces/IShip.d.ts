interface IShip {
  position: IPoint;
  rotation: number;
  velocity: IPoint;
  readonly vertices?: IPoint[];
}
