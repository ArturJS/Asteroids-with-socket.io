const events = require('events');
const _ = require('lodash');
const Ship = require('./entities/Ship.js');
const Bullet = require('./entities/Bullet.js');

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

let battleFieldData = {};

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

    let nextBattleFieldData = _mapBattleFieldData(playerDataMap);

    eventEmitter.emit('updateBattleField', nextBattleFieldData);

    battleFieldData = nextBattleFieldData;

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(playerId, keys) {
  playerDataMap[playerId].keys = keys;
}

function addShip(playerId) {
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
}

function removeShip(playerId) {
  delete playerDataMap[playerId];
}

function getBattleFieldSnapshot() {
  return _.cloneDeep(battleFieldData);
}

/// private methods

function _mapBattleFieldData(playerDataMap) {
  return {
    playerDataMap: _.mapValues(playerDataMap, ({ship, bullets}) => {
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
