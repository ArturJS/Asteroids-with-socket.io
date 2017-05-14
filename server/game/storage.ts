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

let _playersMap: Map<string, IPlayer> = new Map();

let _roomBattleMap: Map<string, IRoomBattle> = new Map();

let _asteroidsMap: Map<string, IAsteroid> = new Map();


function getStorageData(): IStorageData {
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
}:IStorageData): void {
  _playersMap = playersMap;
  _roomBattleMap = roomBattleMap;
  _asteroidsMap = asteroidsMap;
}


function updateKeys(playerId: string, keys: IKeys): void {
  if (_playersMap.has(playerId)) {
    _playersMap.get(playerId).keys = keys;
  }
}


function addShip({playerId, login}:{playerId: string, login: string}, roomId: string): void {
  _playersMap.set(playerId, {
    id: playerId,
    login,
    ship: new Ship(),
    keys: {
      left: 0,
      right: 0,
      up: 0,
      space: 0
    },
    bullets: []
  });

  if (!_roomBattleMap.has(roomId)) {
    let asteroids: IAsteroid[] = _generateAsteroids(_.random(3, 5));

    _.each(asteroids, (asteroid: IAsteroid) => {
      _asteroidsMap.set(asteroid.id, asteroid);
    });

    _roomBattleMap.set(roomId, {
      id: roomId,
      playerIds: [],
      asteroidIds: asteroids.map((asteroid: IAsteroid) => asteroid.id),
      explosions: []
    });
  }

  _roomBattleMap.get(roomId).playerIds.push(playerId);
}


function removeShip(playerId: string, roomId: string): void {
  _playersMap.delete(playerId);

  if (!_roomBattleMap.has(roomId)) return;

  _.remove(_roomBattleMap.get(roomId).playerIds, (pId: string) => pId === playerId);

  if (_roomBattleMap.get(roomId).playerIds.length === 0) {
    let {asteroidIds} = _roomBattleMap.get(roomId);

    _.each(asteroidIds, (asteroidId: string) => _asteroidsMap.delete(asteroidId));

    _roomBattleMap.delete(roomId);
  }
}

/// private methods

function _generateAsteroids(howMany): IAsteroid[] {
  let asteroids: IAsteroid[] = [];

  _.times(howMany, () => {
    asteroids.push(
      new Asteroid({
        id: shortid.generate(),
        radius: _.random(30, 60)
      })
    );
  });

  return asteroids;
}
