"use strict";
exports.__esModule = true;
var _ = require("lodash");
var shortid = require("shortid");
var entities_1 = require("./entities");
var helpers_1 = require("./helpers");
var entities_2 = require("./entities");
exports["default"] = {
    calcNextScene: calcNextScene
};
///
var SCREEN = {
    width: 900,
    height: 600
};
var ROTATION_SPEED = 6;
var SPEED = 0.15;
var INERTIA = 0.99;
function calcNextScene(_a) {
    var playersMap = _a.playersMap, roomBattleMap = _a.roomBattleMap, asteroidsMap = _a.asteroidsMap;
    _removeAllExplosions(roomBattleMap);
    var playerDataList = Array.from(playersMap.values());
    var asteroidDataList = Array.from(asteroidsMap.values());
    // update positions for ships and bullets
    _.each(playerDataList, function (playerData) {
        var ship = playerData.ship, keys = playerData.keys, id = playerData.id;
        _updateShipData(ship, keys);
        var position = ship.position, rotation = ship.rotation;
        _updateBulletsData(playerData.bullets, keys, position, rotation, id);
    });
    // collisions check (and adding asteroids) inside each room
    _.each(Array.from(roomBattleMap.values()), function (room) {
        var _a = _getObjectsInsideRoom({ room: room, playerDataList: playerDataList, asteroidDataList: asteroidDataList }), bulletsInsideRoom = _a.bulletsInsideRoom, shipsInsideRoom = _a.shipsInsideRoom, asteroidsInsideRoom = _a.asteroidsInsideRoom;
        if (asteroidsInsideRoom.length === 0) {
            // create asteroids if there is no asteroids in room
            _addAsteroids(_generateAsteroids(_.random(4, 6)), room.id, asteroidsMap, roomBattleMap);
        }
        // check collisions between Bullets and Asteroids
        _.each(asteroidsInsideRoom, function (asteroid) {
            var bullet = null;
            for (var _i = 0, bulletsInsideRoom_1 = bulletsInsideRoom; _i < bulletsInsideRoom_1.length; _i++) {
                bullet = bulletsInsideRoom_1[_i];
                var hasIntersection = _pointInsidePolygon(bullet.position, asteroid.vertices);
                if (hasIntersection) {
                    _destroyAsteroid({ asteroid: asteroid, roomBattleMap: roomBattleMap, room: room, asteroidsMap: asteroidsMap });
                    _addScoreByPlayerId(playersMap, bullet.playerId);
                    bullet.destroy();
                    return;
                }
            }
        });
        // check collisions between Ships and Asteroids
        _.each(shipsInsideRoom, function (ship) {
            var nearestToShipAsteroids = _getNearestToShipAsteroids(ship, asteroidsInsideRoom);
            var vertices = ship.vertices;
            _.each(nearestToShipAsteroids, function (asteroid) {
                var hasIntersection = _polygonsHaveIntersections(vertices, asteroid.vertices);
                if (hasIntersection) {
                    _destroyAsteroid({ asteroid: asteroid, roomBattleMap: roomBattleMap, room: room, asteroidsMap: asteroidsMap });
                    _addScoreByPlayerId(playersMap, ship.playerId);
                }
            });
        });
    });
    // update positions for asteroids and remove that isDeleted
    _updateAsteroids(asteroidsMap);
    return {
        playersMap: playersMap,
        roomBattleMap: roomBattleMap,
        asteroidsMap: asteroidsMap
    };
}
/// private methods
function _generateAsteroids(howMany) {
    var asteroids = [];
    _.times(howMany, function () {
        asteroids.push(new entities_1.Asteroid({
            id: shortid.generate(),
            radius: _.random(30, 60)
        }));
    });
    return asteroids;
}
function _addScoreByPlayerId(playersMap, playerId) {
    if (playersMap.has(playerId)) {
        playersMap.get(playerId).score++;
    }
}
function _getNearestToShipAsteroids(ship, asteroidsInsideRoom) {
    var nearestToShipAsteroids = [];
    var shipRadius = 20;
    var shipPos = ship.position;
    _.each(asteroidsInsideRoom, function (asteroid) {
        var asteroidPos = asteroid.center;
        var asteroidRadius = asteroid.radius;
        if (Math.pow(asteroidPos.x - shipPos.x, 2) +
            Math.pow(asteroidPos.y - shipPos.y, 2) <= Math.pow(shipRadius + asteroidRadius, 2)) {
            nearestToShipAsteroids.push(asteroid);
        }
    });
    return nearestToShipAsteroids;
}
function _getObjectsInsideRoom(_a) {
    var room = _a.room, playerDataList = _a.playerDataList, asteroidDataList = _a.asteroidDataList;
    var playersInsideRoom = _.filter(playerDataList, function (player) {
        return _.includes(room.playerIds, player.id);
    });
    var bulletsInsideRoom = _.reduce(playersInsideRoom, function (accumulator, player) {
        return accumulator.concat(player.bullets);
    }, []);
    var shipsInsideRoom = playersInsideRoom.map(function (player) { return player.ship; });
    var asteroidsInsideRoom = _.filter(asteroidDataList, function (asteroid) {
        return _.includes(room.asteroidIds, asteroid.id);
    });
    return {
        bulletsInsideRoom: bulletsInsideRoom,
        shipsInsideRoom: shipsInsideRoom,
        asteroidsInsideRoom: asteroidsInsideRoom
    };
}
function _destroyAsteroid(_a) {
    var asteroid = _a.asteroid, roomBattleMap = _a.roomBattleMap, room = _a.room, asteroidsMap = _a.asteroidsMap;
    var asteroidParticles = asteroid.destroy();
    _.remove(roomBattleMap.get(room.id).asteroidIds, function (aId) { return aId === asteroid.id; });
    _addExplosionsInRoom(asteroid, room.id, roomBattleMap);
    _addAsteroids(asteroidParticles, room.id, asteroidsMap, roomBattleMap);
}
function _addExplosionsInRoom(asteroid, roomId, roomBattleMap) {
    roomBattleMap.get(roomId).explosions.push({
        position: asteroid.center,
        radius: asteroid.radius
    });
}
function _removeAllExplosions(roomBattleMap) {
    var roomBattle = null;
    var roomsList = Array.from(roomBattleMap.values());
    for (var _i = 0, roomsList_1 = roomsList; _i < roomsList_1.length; _i++) {
        roomBattle = roomsList_1[_i];
        roomBattle.explosions = [];
    }
}
function _addAsteroids(asteroids, roomId, asteroidsMap, roomBattleMap) {
    _.each(asteroids, function (asteroid) {
        asteroidsMap.set(asteroid.id, asteroid);
        roomBattleMap.get(roomId).asteroidIds.push(asteroid.id);
    });
}
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
function _updateAsteroids(asteroidMap) {
    var asteroidList = Array.from(asteroidMap.values());
    _.each(asteroidList, function (asteroid) {
        var rotationSpeed = asteroid.rotationSpeed, vertices = asteroid.vertices, center = asteroid.center;
        if (asteroid.isDeleted) {
            asteroidMap["delete"](asteroid.id);
            return;
        }
        asteroid.vertices = vertices
            .map(function (v) { return helpers_1.rotatePoint(v, center, rotationSpeed); });
        // Move
        _translatePolygon(asteroid.vertices, {
            dx: asteroid.velocity.x,
            dy: asteroid.velocity.y
        });
        // Screen edges
        if (center.x > SCREEN.width + asteroid.radius) {
            _translatePolygon(asteroid.vertices, { dx: -(SCREEN.width + 2 * asteroid.radius) });
        }
        else if (center.x < -asteroid.radius) {
            _translatePolygon(asteroid.vertices, { dx: SCREEN.width + 2 * asteroid.radius });
        }
        if (center.y > SCREEN.height + asteroid.radius) {
            _translatePolygon(asteroid.vertices, { dy: -(SCREEN.height + 2 * asteroid.radius) });
        }
        else if (center.y < -asteroid.radius) {
            _translatePolygon(asteroid.vertices, { dy: SCREEN.height + 2 * asteroid.radius });
        }
    });
}
function _translatePolygon(vertices, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.dx, dx = _c === void 0 ? 0 : _c, _d = _b.dy, dy = _d === void 0 ? 0 : _d;
    _.each(vertices, function (v) {
        v.x += dx;
        v.y += dy;
    });
}
function _updateBulletsData(bullets, keys, position, rotation, playerId) {
    _.each(bullets, function (bullet) { return _updateBullet(bullet); });
    if (keys.space &&
        (bullets.length === 0 || _.last(bullets).date + 300 < Date.now())) {
        bullets.push(new entities_2.Bullet({ playerId: playerId, position: position, rotation: rotation }));
    }
    _.remove(bullets, function (bullet) { return bullet.isDeleted; });
}
function _updateBullet(bullet) {
    var position = bullet.position, velocity = bullet.velocity;
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
function _polygonsHaveIntersections(polygonA, polygonB) {
    var point = null;
    for (var _i = 0, polygonA_1 = polygonA; _i < polygonA_1.length; _i++) {
        point = polygonA_1[_i];
        if (_pointInsidePolygon(point, polygonB)) {
            return true;
        }
    }
    for (var _a = 0, polygonB_1 = polygonB; _a < polygonB_1.length; _a++) {
        point = polygonB_1[_a];
        if (_pointInsidePolygon(point, polygonA)) {
            return true;
        }
    }
    return false;
}
function _pointInsidePolygon(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point.x, y = point.y;
    var inside = false;
    var i = 0;
    var j = vs.length - 1;
    var xi;
    var yi;
    var xj;
    var yj;
    var intersect;
    for (; i < vs.length; j = i++) {
        xi = vs[i].x;
        yi = vs[i].y;
        xj = vs[j].x;
        yj = vs[j].y;
        intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }
    return inside;
}
