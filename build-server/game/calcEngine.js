//      
                                                       
                                               
                                                   
                                                   
                                               
                                                 
                                                           
                                                             

const _ = require('lodash');
const shortid = require('shortid');
const Asteroid = require('./entities/Asteroid');
const Bullet = require('./entities/Bullet');
const Ship = require('./entities/Ship');
const {rotatePoint} = require('./helpers');

module.exports = {
  calcNextScene
};

///

const SCREEN                                  = {
  width: 1800,
  height: 1200
};

const ROTATION_SPEED         = 6;
const SPEED         = 0.15;
const INERTIA         = 0.99;

function calcNextScene(roomBattleMap              )               {
  for (let roomBattle of roomBattleMap.values()) {
    let {
      players,
      asteroids
    }                                                         = roomBattle;
    let playersList            = Array.from(players.values());
    _cleanUpDeadObjects(roomBattle);
    _checkCollisions(roomBattle);
    _updateObjectsPositions({players: playersList, asteroids})
  }

  return roomBattleMap;
}

/// private methods

function _cleanUpDeadObjects(room             ) {
  room.explosions = [];
  _.remove(room.asteroids, (asteroid           )          => asteroid.isDeleted);
  for (let player of room.players.values()) {
    _.remove(player.bullets, (bullet         )          => bullet.isDeleted);
  }
}

function _checkCollisions(room             ) {
  // collisions check (and adding asteroids) inside each room
  let playersList = Array.from(room.players.values());
  let asteroidsInsideRoom              = room.asteroids;
  let shipsInsideRoom          = playersList.map(player => player.ship);
  let bulletsInsideRoom            = _.flatten(playersList.map(player => player.bullets));

  if (asteroidsInsideRoom.length === 0) {
    // create asteroids if there is no asteroids in room
    _addAsteroids(
      _generateAsteroids(_.random(4, 6)),
      room
    );
  }

  // check collisions between Bullets and Asteroids
  _.each(asteroidsInsideRoom, (asteroid           )       => {
    let bullet         ;

    for (bullet of bulletsInsideRoom) {
      let hasIntersection          = _pointInsidePolygon(bullet.position, asteroid.vertices);

      if (hasIntersection) {
        _destroyAsteroid(asteroid, room);
        _addScoreByPlayerId(room.players, bullet.playerId);
        bullet.destroy();

        return;
      }
    }
  });

  // check collisions between Ships and Asteroids
  _.each(shipsInsideRoom, (ship      )       => {
    let nearestToShipAsteroids              = _getNearestToShipAsteroids(ship, asteroidsInsideRoom);
    let vertices           = ship.getVertices() || [];

    _.each(nearestToShipAsteroids, (asteroid           )       => {
      let hasIntersection          = _polygonsHaveIntersections(vertices, asteroid.vertices);

      if (hasIntersection) {
        _destroyAsteroid(asteroid, room);
        _addScoreByPlayerId(room.players, ship.playerId);
      }
    });
  });
}

function _updateObjectsPositions({
  players,
  asteroids
}                                              ) {
  _updateAsteroids(asteroids);
  _updatePlayersAndBullets(players);
}

function _generateAsteroids(howMany)              {
  let asteroids              = [];

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

function _addScoreByPlayerId(playersMap                      , playerId        )       {
  const player = playersMap.get(playerId);
  if (player) {
    player.score++;
  }
}

function _getNearestToShipAsteroids(ship       , asteroidsInsideRoom             )              {
  let nearestToShipAsteroids              = [];
  const shipRadius         = 20;
  const shipPos         = ship.position;

  _.each(asteroidsInsideRoom, (asteroid           )       => {
    const asteroidPos         = asteroid.getCenter();
    const asteroidRadius         = asteroid.radius;
    if (
      Math.pow(asteroidPos.x - shipPos.x, 2) +
      Math.pow(asteroidPos.y - shipPos.y, 2) <= Math.pow(shipRadius + asteroidRadius, 2)
    ) {
      nearestToShipAsteroids.push(asteroid);
    }
  });

  return nearestToShipAsteroids;
}

function _destroyAsteroid(asteroid           , room             )       {
  let asteroidParticles              = asteroid.destroy();

  _addExplosionsInRoom(asteroid, room);
  _addAsteroids(asteroidParticles, room);
}

function _addExplosionsInRoom(asteroid           , room             )       {
  room.explosions.push({
    position: asteroid.getCenter(),
    radius: asteroid.radius
  });
}

function _addAsteroids(asteroids             , room             )       {
  room.asteroids.push(...asteroids);
}

function _updateShipData(ship       , keys       )       {
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

function _accelerate(velocity        , rotation        , speed        )         {
  return {
    x: velocity.x - Math.sin(-rotation * Math.PI / 180) * speed,
    y: velocity.y - Math.cos(-rotation * Math.PI / 180) * speed
  };
}

function _updatePlayersAndBullets(players           ) {
  players.forEach((playerData         ) => {
    let {
      ship,
      keys,
      id
    }                                        = playerData;

    _updateShipData(ship, keys);

    let {
      position,
      rotation
    }                                      = ship;

    _updateBulletsData(playerData.bullets, keys, position, rotation, id);
  });
}

function _updateAsteroids(asteroidList             )       {
  asteroidList.forEach((asteroid           )       => {
    let {
      rotationSpeed,
      vertices
    }                                             = asteroid;
    let center         = asteroid.getCenter();

    if (asteroid.isDeleted) {
      return;
    }

    asteroid.vertices = vertices
      .map((v        )         => rotatePoint(v, center, rotationSpeed));

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

function _translatePolygon(vertices          , {dx = 0, dy = 0}                            = {})       {
  _.each(vertices, (v        )       => {
    v.x += dx;
    v.y += dy;
  });
}

function _updateBulletsData(bullets           ,
                            keys       ,
                            position        ,
                            rotation        ,
                            playerId        )       {
  _.each(bullets, (bullet         )       => _updateBullet(bullet));

  if (keys.space &&
    (bullets.length === 0 || _.last(bullets).date + 300 < Date.now())) {
    bullets.push(new Bullet({playerId, position, rotation}));
  }
}

function _updateBullet(bullet         )       {
  let {
    position,
    velocity
  } = bullet;

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

function _polygonsHaveIntersections(polygonA          , polygonB          )          {
  let point        ;

  for (point of polygonA) {
    if (_pointInsidePolygon(point, polygonB)) {
      return true;
    }
  }

  for (point of polygonB) {
    if (_pointInsidePolygon(point, polygonA)) {
      return true;
    }
  }

  return false;
}

function _pointInsidePolygon(point        , vs          )          {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  let {
    x, y
  }        = point;

  let inside          = false;

  let i         = 0;
  let j         = vs.length - 1;

  let xi        ;
  let yi        ;

  let xj        ;
  let yj        ;

  let intersect         ;

  for (; i < vs.length; j = i++) {
    xi = vs[i].x;
    yi = vs[i].y;

    xj = vs[j].x;
    yj = vs[j].y;

    intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}
