interface IScene {
  playersMap: Map<string, IPlayer>,
  roomBattleMap: Map<string, IRoomBattle>,
  asteroidsMap: Map<string, IAsteroid>
}