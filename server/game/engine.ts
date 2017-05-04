import * as events from 'events';
import * as shortid from 'shortid';
import * as _ from 'lodash';
import Ship from './entities/Ship';
import Bullet from './entities/Bullet';
import Asteroid from "./entities/Asteroid";
import {rotatePoint} from './helpers';

// TODO: split code and use IOC container

export default {
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

let globalAsteroidsList = [];

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

      // todo get rid from pure functions
      _updateBulletsData(keys, playerData.bullets, position, rotation);
    });

    _updateAsteroids(globalAsteroidsList);

    _.each(roomBattleMap, (battleData, roomId) => {
      eventEmitter.emit('updateBattleField', _mapBattleFieldData(playerDataMap, roomId), roomId);
    });

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(playerId, keys) {
  if (playerDataMap[playerId]) {
    playerDataMap[playerId].keys = keys;
  }
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
    let asteroids = generateAsteroids(_.random(3, 5));

    globalAsteroidsList = [...globalAsteroidsList, ...asteroids];

    roomBattleMap[roomId] = {
      players: [],
      asteroids: asteroids.map(item => item.id)
    };
  }

  roomBattleMap[roomId].players.push(playerId);
}


function removeShip(playerId, roomId) {
  delete playerDataMap[playerId];

  _.remove(roomBattleMap[roomId].players, pId => pId === playerId);

  if (roomBattleMap[roomId].players.length === 0) {
    let asteroidIds = roomBattleMap[roomId].asteroids;

    _.remove(globalAsteroidsList, item => asteroidIds.includes(item.id));

    delete roomBattleMap[roomId];
  }
}

function getBattleFieldSnapshot(roomId) {
  return _mapBattleFieldData(playerDataMap, roomId);
}

/// private methods

function _mapBattleFieldData(allPlayersDataMap, roomId) {
  let playerIds = roomBattleMap[roomId].players;
  let asteroidIds = roomBattleMap[roomId].asteroids;
  let playerDataMap = _.pick(allPlayersDataMap, playerIds);
  let asteroids = globalAsteroidsList.filter(asteroid => asteroidIds.includes(asteroid.id));

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

function _updateAsteroids(asteroids) {
  _.each(asteroids, asteroid => {
    let {
      rotationSpeed,
      vertices,
      center
    } = asteroid;

    asteroid.vertices = vertices
      .map(v => rotatePoint(v, center, rotationSpeed));

    // Move
    _translatePolygon(asteroid.vertices, {
      dx: asteroid.velocity.x,
      dy: asteroid.velocity.y
    });

    // Screen edges
    if (center.x > SCREEN.width + asteroid.radius) {
      _translatePolygon(asteroid.vertices, {dx: -(SCREEN.width + 2 * asteroid.radius)});
    }
    else if (center.x < -asteroid.radius) {
      _translatePolygon(asteroid.vertices, {dx: SCREEN.width + 2 * asteroid.radius});
    }
    if (center.y > SCREEN.height + asteroid.radius) {
      _translatePolygon(asteroid.vertices, {dy: -(SCREEN.height + 2 * asteroid.radius)});
    }
    else if (center.y < -asteroid.radius) {
      _translatePolygon(asteroid.vertices, {dy: SCREEN.height + 2 * asteroid.radius});
    }

  });
}

function _translatePolygon(vertices, {dx = 0, dy = 0}) {
  _.each(vertices, v => {
    v.x += dx;
    v.y += dy;
  });
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

  bullet.position = position;

  // Delete if it goes out of bounds
  if (position.x < 0
    || position.y < 0
    || position.x > SCREEN.width
    || position.y > SCREEN.height) {
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


function generateAsteroids(howMany) { // todo add dependency on ship position
  let asteroids = [];

  for (let i = 0; i < howMany; i++) {
    asteroids.push(
      new Asteroid({
        id: shortid.generate(),
        radius: 50
      })
    );
  }

  return asteroids;
}
