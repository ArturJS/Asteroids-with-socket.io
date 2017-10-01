// @flow
import type {IKeys} from '../interfaces/IKeys';
import type {IStorageData} from '../interfaces/IStorageData';

const Ship = require('./entities/Ship');

module.exports = {
  getStorageData,
  setStorageData,
  updateKeys,
  addShip,
  removeShip
};

///

let _roomBattleMap: IStorageData = new Map();


function getStorageData(): IStorageData {
  return _roomBattleMap;
}

function setStorageData(roomBattleMap: IStorageData): void {
  _roomBattleMap = roomBattleMap;
}


function updateKeys(roomId:string, playerId: string, keys: IKeys): void {
  let room = _roomBattleMap.get(roomId);
  if (!room) return;

  const player = room.players.get(playerId);
  if (player) {
    player.keys = keys;
  };
}


function addShip({playerId, login}:{playerId: string, login: string}, roomId: string): void {
  if (!_roomBattleMap.has(roomId)) {
    _roomBattleMap.set(roomId, {
      id: roomId,
      players: new Map(),
      asteroids: [],
      explosions: []
    });
  }

  const room = _roomBattleMap.get(roomId);

  if (!room) return;

  room.players.set(playerId, {
    id: playerId,
    login,
    ship: new Ship({playerId}),
    keys: {
      left: 0,
      right: 0,
      up: 0,
      space: 0
    },
    score: 0,
    bullets: []
  });
}


function removeShip(playerId: string, roomId: string): void {
  const room = _roomBattleMap.get(roomId);
  if (!room) return;
  room.players.delete(playerId);

  if (room.players.size === 0) {
    _roomBattleMap.delete(roomId);
  }
}
