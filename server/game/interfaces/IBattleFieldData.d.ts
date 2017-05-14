interface IBattleFieldData {
  playerDataMap:{[index: string]: IPlayer};
  asteroids:{vertices:IPoint[]}[];
  explosions: IExplosion[];
}
