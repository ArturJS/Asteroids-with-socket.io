// @flow
import type {IAsteroid} from '../interfaces/IAsteroid';
import type {IShip} from '../interfaces/IShip';
import type {IPlayer} from '../interfaces/IPlayer';
import type {IBullet} from '../interfaces/IBullet';
import type {IKeys} from '../interfaces/IKeys';
import type {IPoint} from '../interfaces/IPoint';
import type {IRoomBattle} from '../interfaces/IRoomBattle';
import type {IStorageData} from '../interfaces/IStorageData';

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

const SCREEN: {width: number, height: number} = {
  width: 1800,
  height: 1200
};

const ROTATION_SPEED: number = 6;
const SPEED: number = 0.15;
const INERTIA: number = 0.99;

function calcNextScene(roomBattleMap: IStorageData): IStorageData {
  for (let roomBattle of roomBattleMap.values()) {
    let {
      players,
      asteroids
    }:{players: Map<string, IPlayer>, asteroids: IAsteroid[]} = roomBattle;
    let playersList: IPlayer[] = Array.from(players.values());
    _cleanUpDeadObjects(roomBattle);
    _checkCollisions(roomBattle);
    _updateObjectsPositions({players: playersList, asteroids})
  }

  return roomBattleMap;
}

/// private methods

function _cleanUpDeadObjects(room: IRoomBattle) {
  room.explosions = [];
  _.remove(room.asteroids, (asteroid: IAsteroid): boolean => asteroid.isDeleted);
  for (let player of room.players.values()) {
    _.remove(player.bullets, (bullet: IBullet): boolean => bullet.isDeleted);
  }
}

function _checkCollisions(room: IRoomBattle) {
  // collisions check (and adding asteroids) inside each room
  let playersList = Array.from(room.players.values());
  let asteroidsInsideRoom: IAsteroid[] = room.asteroids;
  let shipsInsideRoom: IShip[] = playersList.map(player => player.ship);
  let bulletsInsideRoom: IBullet[] = _.flatten(playersList.map(player => player.bullets));

  if (asteroidsInsideRoom.length === 0) {
    // create asteroids if there is no asteroids in room
    _addAsteroids(
      _generateAsteroids(_.random(4, 6)),
      room
    );
  }

  // check collisions between Bullets and Asteroids
  _.each(asteroidsInsideRoom, (asteroid: IAsteroid): void => {
    let bullet: IBullet;

    for (bullet of bulletsInsideRoom) {
      let hasIntersection: boolean = _pointInsidePolygon(bullet.position, asteroid.vertices);

      if (hasIntersection) {
        _destroyAsteroid(asteroid, room);
        _addScoreByPlayerId(room.players, bullet.playerId);
        bullet.destroy();

        return;
      }
    }
  });

  // check collisions between Ships and Asteroids
  _.each(shipsInsideRoom, (ship: Ship): void => {
    let nearestToShipAsteroids: IAsteroid[] = _getNearestToShipAsteroids(ship, asteroidsInsideRoom);
    let vertices: IPoint[] = ship.getVertices() || [];

    _.each(nearestToShipAsteroids, (asteroid: IAsteroid): void => {
      let hasIntersection: boolean = _polygonsHaveIntersections(vertices, asteroid.vertices);

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
}: {players: IPlayer[], asteroids: IAsteroid[]}) {
  _updateAsteroids(asteroids);
  _updatePlayersAndBullets(players);
}

function _generateAsteroids(howMany): IAsteroid[] {
  let asteroids: IAsteroid[] = [];

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

function _addScoreByPlayerId(playersMap: Map<string, IPlayer>, playerId: string): void {
  const player = playersMap.get(playerId);
  if (player) {
    player.score++;
  }
}

function _getNearestToShipAsteroids(ship: IShip, asteroidsInsideRoom: IAsteroid[]): IAsteroid[] {
  let nearestToShipAsteroids: IAsteroid[] = [];
  const shipRadius: number = 20;
  const shipPos: IPoint = ship.position;

  _.each(asteroidsInsideRoom, (asteroid: IAsteroid): void => {
    const asteroidPos: IPoint = asteroid.getCenter();
    const asteroidRadius: number = asteroid.radius;
    if (
      Math.pow(asteroidPos.x - shipPos.x, 2) +
      Math.pow(asteroidPos.y - shipPos.y, 2) <= Math.pow(shipRadius + asteroidRadius, 2)
    ) {
      nearestToShipAsteroids.push(asteroid);
    }
  });

  return nearestToShipAsteroids;
}

function _destroyAsteroid(asteroid: IAsteroid, room: IRoomBattle): void {
  let asteroidParticles: IAsteroid[] = asteroid.destroy();

  _addExplosionsInRoom(asteroid, room);
  _addAsteroids(asteroidParticles, room);
}

function _addExplosionsInRoom(asteroid: IAsteroid, room: IRoomBattle): void {
  room.explosions.push({
    position: asteroid.getCenter(),
    radius: asteroid.radius
  });
}

function _addAsteroids(asteroids: IAsteroid[], room: IRoomBattle): void {
  room.asteroids.push(...asteroids);
}

function _updateShipData(ship: IShip, keys: IKeys): void {
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

function _accelerate(velocity: IPoint, rotation: number, speed: number): IPoint {
  return {
    x: velocity.x - Math.sin(-rotation * Math.PI / 180) * speed,
    y: velocity.y - Math.cos(-rotation * Math.PI / 180) * speed
  };
}

function _updatePlayersAndBullets(players: IPlayer[]) {
  players.forEach((playerData: IPlayer) => {
    let {
      ship,
      keys,
      id
    }:{ship: IShip, keys: IKeys, id: string} = playerData;

    _updateShipData(ship, keys);

    let {
      position,
      rotation
    }:{position: IPoint, rotation: number} = ship;

    _updateBulletsData(playerData.bullets, keys, position, rotation, id);
  });
}

function _updateAsteroids(asteroidList: IAsteroid[]): void {
  asteroidList.forEach((asteroid: IAsteroid): void => {
    let {
      rotationSpeed,
      vertices
    }:{rotationSpeed: number, vertices: IPoint[]} = asteroid;
    let center: IPoint = asteroid.getCenter();

    if (asteroid.isDeleted) {
      return;
    }

    asteroid.vertices = vertices
      .map((v: IPoint): IPoint => rotatePoint(v, center, rotationSpeed));

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

function _translatePolygon(vertices: IPoint[], {dx = 0, dy = 0}:{dx?: number, dy?: number} = {}): void {
  _.each(vertices, (v: IPoint): void => {
    v.x += dx;
    v.y += dy;
  });
}

function _updateBulletsData(bullets: IBullet[],
                            keys: IKeys,
                            position: IPoint,
                            rotation: number,
                            playerId: string): void {
  _.each(bullets, (bullet: IBullet): void => _updateBullet(bullet));

  if (keys.space &&
    (bullets.length === 0 || _.last(bullets).date + 300 < Date.now())) {
    bullets.push(new Bullet({playerId, position, rotation}));
  }
}

function _updateBullet(bullet: IBullet): void {
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

function _polygonsHaveIntersections(polygonA: IPoint[], polygonB: IPoint[]): boolean {
  let point: IPoint;

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

function _pointInsidePolygon(point: IPoint, vs: IPoint[]): boolean {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  let {
    x, y
  }:IPoint = point;

  let inside: boolean = false;

  let i: number = 0;
  let j: number = vs.length - 1;

  let xi: number;
  let yi: number;

  let xj: number;
  let yj: number;

  let intersect: boolean;

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
