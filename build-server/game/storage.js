//      
                                               
                                                             

const Ship = require('./entities/Ship');

module.exports = {
  getStorageData,
  setStorageData,
  updateKeys,
  addShip,
  removeShip
};

///

let _roomBattleMap               = new Map();


function getStorageData()               {
  return _roomBattleMap;
}

function setStorageData(roomBattleMap              )       {
  _roomBattleMap = roomBattleMap;
}


function updateKeys(roomId       , playerId        , keys       )       {
  let room = _roomBattleMap.get(roomId);
  if (!room) return;

  const player = room.players.get(playerId);
  if (player) {
    player.keys = keys;
  };
}


function addShip({playerId, login}                                  , roomId        )       {
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


function removeShip(playerId        , roomId        )       {
  const room = _roomBattleMap.get(roomId);
  if (!room) return;
  room.players.delete(playerId);

  if (room.players.size === 0) {
    _roomBattleMap.delete(roomId);
  }
}
