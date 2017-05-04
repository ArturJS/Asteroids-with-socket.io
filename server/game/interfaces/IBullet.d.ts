interface IBullet {
  position: IPoint;
  rotation: number;
  velocity: IPoint;
  isDeleted: boolean;
  date: number;
  destroy?():void;
}
