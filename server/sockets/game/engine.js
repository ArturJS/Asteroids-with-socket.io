const events = require('events');
const _ = require('lodash');
const Ship = require('./entities/Ship.js');
const Bullet = require('./entities/Bullet.js');

// TODO: split code and use IOC container

module.exports = {
  runGameCircle,
  updateKeys,
  addShip,
  removeShip,
  getBattleFieldSnapshot
};

///

const SCREEN = {
  width: 900,
  height: 600
};

const ROTATION_SPEED = 6;
const SPEED = 0.15;
const INERTIA = 0.99;

let playerDataMap = {};

let roomBattleMap = {};

function runGameCircle() {
  const eventEmitter = new events.EventEmitter();

  setInterval(() => {
    let playerDataList = _.values(playerDataMap);

    _.each(playerDataList, (playerData) => {
      let {
        ship,
        keys
      } = playerData;

      ship.update(
        _updateShipData(keys, ship.get(), {
          SCREEN,
          ROTATION_SPEED,
          SPEED,
          INERTIA
        })
      );

      let {
        position,
        rotation
      } = ship.get();

      // todo make it pure function
      _updateBulletsData(keys, playerData.bullets, position, rotation);
    });


    _.each(roomBattleMap, (battleData, roomId) => {
      eventEmitter.emit('updateBattleField', _mapBattleFieldData(playerDataMap, roomId), roomId);
    });

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(playerId, keys) {
  playerDataMap[playerId].keys = keys;
}


function addShip(playerId, roomId) {
  playerDataMap[playerId] = {
    ship: new Ship(),
    keys: {
      left: 0,
      right: 0,
      up: 0,
      space: 0
    },
    bullets: []
  };

  if (!roomBattleMap.hasOwnProperty(roomId)) {
    roomBattleMap[roomId] = {
      players: []
    };
  }

  roomBattleMap[roomId].players.push(playerId);
}


function removeShip(playerId, roomId) {
  delete playerDataMap[playerId];

  _.remove(roomBattleMap[roomId].players, pId => pId === playerId);

  if (roomBattleMap[roomId].players.length === 0) {
    delete roomBattleMap[roomId];
  }
}

function getBattleFieldSnapshot(roomId) {
  return _mapBattleFieldData(playerDataMap, roomId);
}

/// private methods

function _mapBattleFieldData(playerDataMap, roomId) {
  let relatedPlayerIds = roomBattleMap[roomId].players;
  let relatedPlayerDataMap = _.pick(playerDataMap, relatedPlayerIds);

  return {
    playerDataMap: _.mapValues(relatedPlayerDataMap, ({ship, bullets}) => {
      return {
        ship: ship.get(),
        bullets: bullets.map(bullet => bullet.get())
      };
    })
  };
}

function _updateBulletsData(keys, bullets, position, rotation) {
  _.each(bullets, (bullet) => _updateBullet(bullet));

  if (keys.space &&
    (bullets.length === 0 || _.last(bullets).shotDate + 300 < Date.now())) {
    bullets.push(new Bullet({position, rotation}));
  }

  _.remove(bullets, bullet => bullet.isDeleted);
}

function _updateBullet(bullet) {
  let {
    position,
    velocity
  } = bullet.get();

  // Move
  position.x += velocity.x;
  position.y += velocity.y;

  bullet.update({
    position
  });

  // Delete if it goes out of bounds
  if ( position.x < 0
    || position.y < 0
    || position.x > SCREEN.width
    || position.y > SCREEN.height ) {
    bullet.destroy();
  }
}

function _updateShipData(keys, shipData, params) {
  shipData = _.cloneDeep(shipData);

  const {
    ROTATION_SPEED,
    SPEED,
    INERTIA,
    SCREEN
  } = _.cloneDeep(params);

  let {velocity, rotation, position} = shipData;

  if (keys.up) {
    velocity = _accelerate(velocity, rotation, SPEED);
  }
  if (keys.left) {
    rotation -= ROTATION_SPEED;
  }
  if (keys.right) {
    rotation += ROTATION_SPEED;
  }

  if (rotation >= 360) {
    rotation -= 360;
  }
  if (rotation <= 0) {
    rotation += 360;
  }

  position.x += velocity.x;
  position.y += velocity.y;
  velocity.x *= INERTIA;
  velocity.y *= INERTIA;

  if (position.x > SCREEN.width) {
    position.x = 0;
  }
  else if (position.x < 0) {
    position.x = SCREEN.width;
  }

  if (position.y > SCREEN.height) {
    position.y = 0;
  }
  else if (position.y < 0) {
    position.y = SCREEN.height;
  }

  return {
    position,
    rotation,
    velocity
  };
}

function _accelerate(velocity, rotation, speed) {
  return {
    x: velocity.x - Math.sin(-rotation * Math.PI / 180) * speed,
    y: velocity.y - Math.cos(-rotation * Math.PI / 180) * speed
  };
}
