import * as _ from 'lodash';
import {rotatePoint} from './helpers';
import {Bullet} from './entities';

export default {
  calcNextScene
};

///

const SCREEN: {width: number, height: number} = {
  width: 900,
  height: 600
};

const ROTATION_SPEED: number = 6;
const SPEED: number = 0.15;
const INERTIA: number = 0.99;

function calcNextScene({
  playersMap,
  roomBattleMap,
  asteroidsMap
}:IScene): IScene {

  let playerDataList: IPlayer[] = Array.from(playersMap.values());
  let asteroidDataList: IAsteroid[] = Array.from(asteroidsMap.values());

  // update positions for ships and bullets
  _.each(playerDataList, (playerData: IPlayer) => {
    let {
      ship,
      keys
    }:{ship: IShip, keys: IKeys} = playerData;

    _updateShipData(ship, keys);

    let {
      position,
      rotation
    }:{position: IPoint, rotation: number} = ship;

    _updateBulletsData(playerData.bullets, keys, position, rotation);
  });

  // check collisions between bullets and asteroids inside each room
  _.each(Array.from(roomBattleMap.values()), (room: IRoomBattle): void => {

    let playersInsideRoom: IPlayer[] = _.filter(playerDataList, (player: IPlayer): boolean => {
      return _.includes(room.playerIds, player.id);
    });

    let bulletsInsideRoom: IBullet[] = _.reduce(playersInsideRoom, (accumulator: IBullet[], player: IPlayer): IBullet[] => {
      return [...accumulator, ...player.bullets];
    }, []);

    if (!bulletsInsideRoom.length) return;

    let asteroidsInsideRoom: IAsteroid[] = _.filter(asteroidDataList, (asteroid: IAsteroid): boolean => {
      return _.includes(room.asteroidIds, asteroid.id);
    });

    _.each(asteroidsInsideRoom, (asteroid: IAsteroid): void => {
      let bullet: IBullet = null;

      for (bullet of bulletsInsideRoom) {
        let hasIntersection: boolean = _pointInsidePolygon(bullet.position, asteroid.vertices);

        if (hasIntersection) {
          let asteroidParticles: IAsteroid[] = asteroid.destroy();

          _.remove(roomBattleMap.get(room.id).asteroidIds, (aId: string): boolean => aId === asteroid.id);

          bullet.destroy();

          _addAsteroids(asteroidParticles, room.id, asteroidsMap, roomBattleMap);

          return;
        }
      }
    });
  });

  // update positions for asteroids and remove that isDeleted
  _updateAsteroids(asteroidsMap);

  return {
    playersMap,
    roomBattleMap,
    asteroidsMap
  };
}

/// private methods

function _addAsteroids(asteroids: IAsteroid[],
                       roomId: string,
                       asteroidsMap: Map<string, IAsteroid>,
                       roomBattleMap: Map<string, IRoomBattle>): void {
  _.each(asteroids, (asteroid: IAsteroid): void => {
    asteroidsMap.set(asteroid.id, asteroid);
    roomBattleMap.get(roomId).asteroidIds.push(asteroid.id);
  });
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


function _updateAsteroids(asteroidMap: Map<string, IAsteroid>): void {
  let asteroidList: IAsteroid[] = Array.from(asteroidMap.values());

  _.each(asteroidList, (asteroid: IAsteroid): void => {
    let {
      rotationSpeed,
      vertices,
      center
    }:{rotationSpeed: number, vertices: IPoint[], center: IPoint} = asteroid;

    if (asteroid.isDeleted) {
      asteroidMap.delete(asteroid.id);
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

function _updateBulletsData(bullets: IBullet[], keys: IKeys, position: IPoint, rotation: number): void {
  _.each(bullets, (bullet: IBullet): void => _updateBullet(bullet));

  if (keys.space &&
    (bullets.length === 0 || _.last(bullets).date + 300 < Date.now())) {
    bullets.push(new Bullet({position, rotation}));
  }

  _.remove(bullets, (bullet: IBullet): boolean => bullet.isDeleted);
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
