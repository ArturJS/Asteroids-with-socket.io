import * as events from 'events';
import * as _ from 'lodash';
import calcEngine from './calcEngine';
import gameStorage from './storage';
import EventEmitter = NodeJS.EventEmitter;

export default {
  runGameCircle,
  updateKeys,
  addShip,
  removeShip,
  getBattleFieldSnapshot
};

///

function runGameCircle(): EventEmitter {
  const eventEmitter: EventEmitter = new events.EventEmitter();

  setInterval((): void => {
    _.flow(
      gameStorage.getStorageData,
      calcEngine.calcNextScene,
      gameStorage.setStorageData
    )();

    let gameStorageData: IStorageData = gameStorage.getStorageData();

    let roomIds = Array.from(gameStorageData.keys());

    _.each(roomIds, (roomId: string) => {
      eventEmitter.emit('updateBattleField', _mapBattleFieldData(gameStorageData, roomId), roomId);
    });

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(roomId: string, playerId: string, keys: IKeys): void {
  gameStorage.updateKeys(roomId, playerId, keys);
}

function addShip({playerId, login}:{playerId: string, login: string}, roomId: string): void {
  gameStorage.addShip({playerId, login}, roomId);
}

function removeShip(playerId: string, roomId: string): void {
  gameStorage.removeShip(playerId, roomId);
}

function getBattleFieldSnapshot(roomId: string) {
  return _mapBattleFieldData(gameStorage.getStorageData(), roomId);
}

/// private methods

function _mapBattleFieldData(roomBattleMap: IStorageData, roomId: string): IBattleFieldData {
  let {
    players,
    asteroids,
    explosions
  }:{players: Map<string, IPlayer>, asteroids: IAsteroid[], explosions: IExplosion[]} = roomBattleMap.get(roomId);

  let playersList: IPlayer[] = Array.from(players.values());

  return {
    players: playersList.map(({id, login, ship, bullets, score, keys}) => {
      return {
        id,
        login,
        ship: {
          playerId: ship.playerId,
          position: ship.position,
          rotation: ship.rotation,
          velocity: ship.velocity
        },
        keys: {
          left: keys.left,
          right: keys.right,
          up: keys.up,
          space: keys.space
        },
        score: score,
        bullets: bullets.map((bullet: IBullet) => ({
          playerId: id,
          position: bullet.position,
          rotation: bullet.rotation,
          velocity: bullet.velocity,
          isDeleted: bullet.isDeleted,
          date: bullet.date
        }))
      };
    }),
    asteroids: asteroids
      .map((asteroid: IAsteroid): {vertices: IPoint[]} => ({
        vertices: asteroid.vertices.map((v: IPoint): IPoint => ({x: v.x, y: v.y}))
      })),
    explosions: explosions.map((explosion: IExplosion) => ({
      position: explosion.position,
      radius: explosion.radius
    }))
  };
}
