//      
                                                       
                                                                     
                                                   
                                                         
                                               
                                                   
                                                 
                                               
                                                             

const events = require('events');
const _ = require('lodash');
const calcEngine = require('./calcEngine');
const gameStorage = require('./storage');

module.exports = {
  runGameCircle,
  updateKeys,
  addShip,
  removeShip,
  getBattleFieldSnapshot
};

///

function runGameCircle() {
  const eventEmitter = new events.EventEmitter();

  setInterval(()       => {
    _.flow(
      gameStorage.getStorageData,
      calcEngine.calcNextScene,
      gameStorage.setStorageData
    )();

    let gameStorageData               = gameStorage.getStorageData();

    let roomIds = Array.from(gameStorageData.keys());

    _.each(roomIds, (roomId        ) => {
      eventEmitter.emit('updateBattleField', _mapBattleFieldData(gameStorageData, roomId), roomId);
    });

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(roomId        , playerId        , keys       )       {
  gameStorage.updateKeys(roomId, playerId, keys);
}

function addShip({playerId, login}                                  , roomId        )       {
  gameStorage.addShip({playerId, login}, roomId);
}

function removeShip(playerId        , roomId        )       {
  gameStorage.removeShip(playerId, roomId);
}

function getBattleFieldSnapshot(roomId        ) {
  return _mapBattleFieldData(gameStorage.getStorageData(), roomId);
}

/// private methods

function _mapBattleFieldData(roomBattleMap              , roomId        )                   {
  const room = roomBattleMap.get(roomId);
  if (!room) {
    return {
      players: [],
      asteroids: [],
      explosions: []
    };
  }

  let {
    players,
    asteroids,
    explosions
  }                                                                                   = room;

  let playersList            = Array.from(players.values());

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
        bullets: bullets.map((bullet         ) => ({
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
      .map((asteroid           )                       => ({
        vertices: asteroid.vertices.map((v        )         => ({x: v.x, y: v.y}))
      })),
    explosions: explosions.map((explosion            ) => ({
      position: explosion.position,
      radius: explosion.radius
    }))
  };
}
