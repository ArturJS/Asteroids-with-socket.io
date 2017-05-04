import * as events from 'events';
import * as _ from 'lodash';
import calcEngine from './calcEngine';
import gameStorage from './storage';

// TODO: use IOC container http://inversify.io/

export default {
  runGameCircle,
  updateKeys,
  addShip,
  removeShip,
  getBattleFieldSnapshot
};

///

function runGameCircle() {
  const eventEmitter = new events.EventEmitter();

  setInterval(() => {
    _.flow([
      gameStorage.getStorageData,
      calcEngine.calcNextScene,
      gameStorage.setStorageData
    ])();

    let gameStorageData = gameStorage.getStorageData();

    let roomIds = Object.keys(gameStorageData.roomBattleMap);

    _.each(roomIds, (roomId) => {
      eventEmitter.emit('updateBattleField', _mapBattleFieldData(gameStorageData, roomId), roomId);
    });

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(playerId, keys) {
  gameStorage.updateKeys(playerId, keys);
}

function addShip(playerId, roomId) {
  gameStorage.addShip(playerId, roomId);
}

function removeShip(playerId, roomId) {
  gameStorage.removeShip(playerId, roomId);
}

function getBattleFieldSnapshot(roomId) {
  return _mapBattleFieldData(gameStorage.getStorageData(), roomId);
}

/// private methods

function _mapBattleFieldData({
  playersMap,
  roomBattleMap,
  asteroidsMap
}, roomId) {

  let {
    playerIds,
    asteroidIds
  } = roomBattleMap[roomId];

  let playerDataMap = _.pick(playersMap, playerIds);
  let asteroids = _.values(_.pick(asteroidsMap, asteroidIds));

  return {
    playerDataMap: _.mapValues(playerDataMap, ({ship, bullets, keys}) => {
      return {
        ship: ship.get(),
        keys: {
          left: keys.left,
          right: keys.right,
          up: keys.up,
          space: keys.space
        },
        bullets: bullets.map(bullet => bullet.get())
      };
    }),
    asteroids: asteroids
      .map(asteroid => ({
        vertices: asteroid.vertices.map(v => ({x: v.x, y: v.y}))
      }))
  };
}
