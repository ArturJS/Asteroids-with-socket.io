interface IAsteroid {
  id: string,
  velocity: IPoint,
  isDeleted: boolean,
  vertices: IPoint[],
  radius: number,
  rotationSpeed: number,
  readonly center: IPoint
}
