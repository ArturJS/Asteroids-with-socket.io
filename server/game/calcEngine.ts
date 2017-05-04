import * as _ from 'lodash';
import {rotatePoint} from './helpers';
import {Bullet} from './entities';

export default {
  calcNextScene
};

///

const SCREEN = {
  width: 900,
  height: 600
};

const ROTATION_SPEED = 6;
const SPEED = 0.15;
const INERTIA = 0.99;

function calcNextScene({
  playersMap,
  roomBattleMap,
  asteroidsMap
}) {
  playersMap = _.cloneDeep(playersMap);
  roomBattleMap = _.cloneDeep(roomBattleMap);
  asteroidsMap = _.cloneDeep(asteroidsMap);

  let playerDataList = _.values(playersMap);

  _.each(playerDataList, (playerData) => {
    let {
      ship,
      keys
    } = playerData;

    _updateShipData(ship, keys);

    let {
      position,
      rotation
    } = ship;

    _updateBulletsData(playerData.bullets, keys, position, rotation);
  });

  _updateAsteroids(asteroidsMap);

  return {
    playersMap,
    roomBattleMap,
    asteroidsMap
  };
}

/// private methods


function _updateShipData(ship, keys) {
  if (keys.up) {
    ship.velocity = _accelerate(ship.velocity, ship.rotation, SPEED);
  }
  if (keys.left) {
    ship.rotation -= ROTATION_SPEED;
  }
  if (keys.right) {
    ship.rotation += ROTATION_SPEED;
  }

  if (ship.rotation >= 360) {
    ship.rotation -= 360;
  }
  if (ship.rotation <= 0) {
    ship.rotation += 360;
  }

  ship.position.x += ship.velocity.x;
  ship.position.y += ship.velocity.y;
  ship.velocity.x *= INERTIA;
  ship.velocity.y *= INERTIA;

  if (ship.position.x > SCREEN.width) {
    ship.position.x = 0;
  }
  else if (ship.position.x < 0) {
    ship.position.x = SCREEN.width;
  }

  if (ship.position.y > SCREEN.height) {
    ship.position.y = 0;
  }
  else if (ship.position.y < 0) {
    ship.position.y = SCREEN.height;
  }
}

function _accelerate(velocity, rotation, speed) {
  return {
    x: velocity.x - Math.sin(-rotation * Math.PI / 180) * speed,
    y: velocity.y - Math.cos(-rotation * Math.PI / 180) * speed
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

function _updateBulletsData(bullets, keys, position, rotation) {
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
