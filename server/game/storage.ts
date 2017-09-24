import {Ship} from './entities';

export default {
  getStorageData,
  setStorageData,
  updateKeys,
  addShip,
  removeShip
};

///

let _roomBattleMap: IStorageData = new Map<string, IRoomBattle>();


function getStorageData(): IStorageData {
  return _roomBattleMap;
}

function setStorageData(roomBattleMap: IStorageData): void {
  _roomBattleMap = roomBattleMap;
}


function updateKeys(roomId:string, playerId: string, keys: IKeys): void {
  let room = _roomBattleMap.get(roomId);
  if (room && room.players.has(playerId)) {
    room.players.get(playerId).keys = keys;
  }
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

  _roomBattleMap.get(roomId).players.set(playerId, {
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
  if (!_roomBattleMap.has(roomId)) return;
  _roomBattleMap.get(roomId).players.delete(playerId);

  if (_roomBattleMap.get(roomId).players.size === 0) {
    _roomBattleMap.delete(roomId);
  }
}
