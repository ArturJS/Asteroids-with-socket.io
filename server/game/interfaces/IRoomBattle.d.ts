interface IRoomBattle {
  id: string;
  players: Map<string, IPlayer>;
  asteroids: IAsteroid[];
  explosions: IExplosion[]
}
