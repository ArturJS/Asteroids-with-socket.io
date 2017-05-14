import * as events from 'events';
import * as _ from 'lodash';
import calcEngine from './calcEngine';
import gameStorage from './storage';
import EventEmitter = NodeJS.EventEmitter;

// TODO: use IOC container http://inversify.io/

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

    let roomIds = Array.from(gameStorageData.roomBattleMap.keys());

    _.each(roomIds, (roomId: string) => {
      eventEmitter.emit('updateBattleField', _mapBattleFieldData(gameStorageData, roomId), roomId);
    });

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(playerId: string, keys: IKeys): void {
  gameStorage.updateKeys(playerId, keys);
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

function _mapBattleFieldData({
  playersMap,
  roomBattleMap,
  asteroidsMap
}:IStorageData, roomId: string): IBattleFieldData {

  let {
    playerIds,
    asteroidIds,
    explosions
  }:{playerIds: string[], asteroidIds: string[], explosions: IExplosion[]} = roomBattleMap.get(roomId);

  let playerDataMap: {[index: string]: IPlayer} = {};

  _.each(playerIds, (pId: string): void => {
    playerDataMap[pId] = playersMap.get(pId)
  });

  let asteroids: IAsteroid[] = [];

  _.each(asteroidIds, (pId: string): void => {
    asteroids.push(asteroidsMap.get(pId));
  });

  return {
    playerDataMap: _.mapValues(playerDataMap, ({id, login, ship, bullets, keys}) => {
      return {
        id,
        login,
        ship: {
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
        bullets: bullets.map((bullet: IBullet) => ({
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
