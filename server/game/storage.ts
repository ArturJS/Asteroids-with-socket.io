import {Asteroid, Ship} from './entities';
import * as shortid from 'shortid';
import * as _ from 'lodash';

export default {
  getStorageData,
  setStorageData,
  updateKeys,
  addShip,
  removeShip
};

///

let _playersMap = {};

let _roomBattleMap = {};

let _asteroidsMap = {};


function getStorageData() {
  return {
    playersMap: _playersMap,
    roomBattleMap: _roomBattleMap,
    asteroidsMap: _asteroidsMap
  };
}

function setStorageData({
  playersMap,
  roomBattleMap,
  asteroidsMap
}) {
  _playersMap = playersMap;
  _roomBattleMap = roomBattleMap;
  _asteroidsMap = asteroidsMap;
}


function updateKeys(playerId, keys) {
  if (_playersMap[playerId]) {
    _playersMap[playerId].keys = keys;
  }
}


function addShip(playerId, roomId) {
  _playersMap[playerId] = {
    ship: new Ship(),
    keys: {
      left: 0,
      right: 0,
      up: 0,
      space: 0
    },
    bullets: []
  };

  if (!_roomBattleMap.hasOwnProperty(roomId)) {
    let asteroids = _generateAsteroids(_.random(3, 5));

    _.each(asteroids, asteroid => {
      _asteroidsMap[asteroid.id] = asteroid;
    });

    _roomBattleMap[roomId] = {
      playerIds: [],
      asteroidIds: asteroids.map(item => item.id)
    };
  }

  _roomBattleMap[roomId].playerIds.push(playerId);
}


function removeShip(playerId, roomId) {
  delete _playersMap[playerId];

  _.remove(_roomBattleMap[roomId].playerIds, pId => pId === playerId);

  if (_roomBattleMap[roomId].playerIds.length === 0) {
    let {asteroidIds} = _roomBattleMap[roomId];

    _asteroidsMap = _.omit(_asteroidsMap, asteroidIds);

    delete _roomBattleMap[roomId];
  }
}

/// private methods


function _generateAsteroids(howMany) {
  let asteroids = [];

  for (let i = 0; i < howMany; i++) {
    asteroids.push(
      new Asteroid({
        id: shortid.generate(),
        radius: _.random(30, 60)
      })
    );
  }

  return asteroids;
}
