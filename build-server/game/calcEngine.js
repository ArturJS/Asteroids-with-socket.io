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
function calcNextScene(roomBattleMap) {
    for (var _i = 0, _a = Array.from(roomBattleMap.values()); _i < _a.length; _i++) {
        var roomBattle = _a[_i];
        var players = roomBattle.players, asteroids = roomBattle.asteroids;
        var playersList = Array.from(players.values());
        _cleanUpDeadObjects(roomBattle);
        _checkCollisions(roomBattle);
        _updateObjectsPositions({ players: playersList, asteroids: asteroids });
    }
    return roomBattleMap;
}
/// private methods
function _cleanUpDeadObjects(room) {
    room.explosions = [];
    _.remove(room.asteroids, function (asteroid) { return asteroid.isDeleted; });
    for (var _i = 0, _a = Array.from(room.players.values()); _i < _a.length; _i++) {
        var player = _a[_i];
        _.remove(player.bullets, function (bullet) { return bullet.isDeleted; });
    }
}
function _checkCollisions(room) {
    // collisions check (and adding asteroids) inside each room
    var playersList = Array.from(room.players.values());
    var asteroidsInsideRoom = room.asteroids;
    var shipsInsideRoom = playersList.map(function (player) { return player.ship; });
    var bulletsInsideRoom = _.flatten(playersList.map(function (player) { return player.bullets; }));
    if (asteroidsInsideRoom.length === 0) {
        // create asteroids if there is no asteroids in room
        _addAsteroids(_generateAsteroids(_.random(4, 6)), room);
    }
    // check collisions between Bullets and Asteroids
    _.each(asteroidsInsideRoom, function (asteroid) {
        var bullet = null;
        for (var _i = 0, bulletsInsideRoom_1 = bulletsInsideRoom; _i < bulletsInsideRoom_1.length; _i++) {
            bullet = bulletsInsideRoom_1[_i];
            var hasIntersection = _pointInsidePolygon(bullet.position, asteroid.vertices);
            if (hasIntersection) {
                _destroyAsteroid(asteroid, room);
                _addScoreByPlayerId(room.players, bullet.playerId);
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
                _destroyAsteroid(asteroid, room);
                _addScoreByPlayerId(room.players, ship.playerId);
            }
        });
    });
}
function _updateObjectsPositions(_a) {
    var players = _a.players, asteroids = _a.asteroids;
    _updateAsteroids(asteroids);
    _updatePlayersAndBullets(players);
}
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
function _destroyAsteroid(asteroid, room) {
    var asteroidParticles = asteroid.destroy();
    _addExplosionsInRoom(asteroid, room);
    _addAsteroids(asteroidParticles, room);
}
function _addExplosionsInRoom(asteroid, room) {
    room.explosions.push({
        position: asteroid.center,
        radius: asteroid.radius
    });
}
function _addAsteroids(asteroids, room) {
    (_a = room.asteroids).push.apply(_a, asteroids);
    var _a;
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
function _updatePlayersAndBullets(players) {
    players.forEach(function (playerData) {
        var ship = playerData.ship, keys = playerData.keys, id = playerData.id;
        _updateShipData(ship, keys);
        var position = ship.position, rotation = ship.rotation;
        _updateBulletsData(playerData.bullets, keys, position, rotation, id);
    });
}
function _updateAsteroids(asteroidList) {
    asteroidList.forEach(function (asteroid) {
        var rotationSpeed = asteroid.rotationSpeed, vertices = asteroid.vertices, center = asteroid.center;
        if (asteroid.isDeleted) {
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
