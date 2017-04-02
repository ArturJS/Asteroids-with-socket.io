const events = require('events');
const _ = require('lodash');
const Ship = require('./entities/Ship.js');

module.exports = {
  runGameCircle,
  updateKeys,
  getBattleFieldSnapshot
};

///

let keys = {
  left: 0,
  right: 0,
  up: 0,
  space: 0
};

const SCREEN = {
  width: 900,
  height: 600
};

const ROTATION_SPEED = 6;
const SPEED = 0.15;
const INERTIA = 0.99;

let prevBattleFieldData = {};

function runGameCircle() {
  const eventEmitter = new events.EventEmitter();
  let ship = new Ship();

  setInterval(() => {
    ship.update(
      _updateShipData(keys, ship.get(), {
        SCREEN,
        ROTATION_SPEED,
        SPEED,
        INERTIA
      })
    );

    let nextBattleFieldData = ship.get();

    if (_isNotEqual(prevBattleFieldData, nextBattleFieldData)) {
      eventEmitter.emit('updateBattleField', nextBattleFieldData);
    }

    prevBattleFieldData = nextBattleFieldData;

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(newKeys) {
  keys = newKeys;
}

function getBattleFieldSnapshot() {
  return _.cloneDeep(prevBattleFieldData);
}

/// private methods

function _isNotEqual(data1, data2) {
  return data1.rotation !== data2.rotation ||
    Math.floor(data1.position.x) !== Math.floor(data2.position.x) ||
    Math.floor(data1.position.y) !== Math.floor(data2.position.y);
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
