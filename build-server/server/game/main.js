"use strict";
exports.__esModule = true;
var events = require("events");
var _ = require("lodash");
var calcEngine_1 = require("./calcEngine");
var storage_1 = require("./storage");
// TODO: use IOC container http://inversify.io/
exports["default"] = {
    runGameCircle: runGameCircle,
    updateKeys: updateKeys,
    addShip: addShip,
    removeShip: removeShip,
    getBattleFieldSnapshot: getBattleFieldSnapshot
};
///
function runGameCircle() {
    var eventEmitter = new events.EventEmitter();
    setInterval(function () {
        _.flow(storage_1["default"].getStorageData, calcEngine_1["default"].calcNextScene, storage_1["default"].setStorageData)();
        var gameStorageData = storage_1["default"].getStorageData();
        var roomIds = Array.from(gameStorageData.roomBattleMap.keys());
        _.each(roomIds, function (roomId) {
            eventEmitter.emit('updateBattleField', _mapBattleFieldData(gameStorageData, roomId), roomId);
        });
    }, 1000 / 60);
    return eventEmitter;
}
function updateKeys(playerId, keys) {
    storage_1["default"].updateKeys(playerId, keys);
}
function addShip(_a, roomId) {
    var playerId = _a.playerId, login = _a.login;
    storage_1["default"].addShip({ playerId: playerId, login: login }, roomId);
}
function removeShip(playerId, roomId) {
    storage_1["default"].removeShip(playerId, roomId);
}
function getBattleFieldSnapshot(roomId) {
    return _mapBattleFieldData(storage_1["default"].getStorageData(), roomId);
}
/// private methods
function _mapBattleFieldData(_a, roomId) {
    var playersMap = _a.playersMap, roomBattleMap = _a.roomBattleMap, asteroidsMap = _a.asteroidsMap;
    var _b = roomBattleMap.get(roomId), playerIds = _b.playerIds, asteroidIds = _b.asteroidIds, explosions = _b.explosions;
    var playerDataMap = {};
    _.each(playerIds, function (pId) {
        playerDataMap[pId] = playersMap.get(pId);
    });
    var asteroids = [];
    _.each(asteroidIds, function (pId) {
        asteroids.push(asteroidsMap.get(pId));
    });
    return {
        playerDataMap: _.mapValues(playerDataMap, function (_a) {
            var id = _a.id, login = _a.login, ship = _a.ship, bullets = _a.bullets, score = _a.score, keys = _a.keys;
            return {
                id: id,
                login: login,
                ship: {
                    playerId: ship.playerId,
                    position: ship.position,
                    rotation: ship.rotation,
                    velocity: ship.velocity
                },
                keys: {
                    left: keys.left,
                    right: keys.right,
                    up: keys.up,
                    space: keys.space
                },
                score: score,
                bullets: bullets.map(function (bullet) { return ({
                    playerId: id,
                    position: bullet.position,
                    rotation: bullet.rotation,
                    velocity: bullet.velocity,
                    isDeleted: bullet.isDeleted,
                    date: bullet.date
                }); })
            };
        }),
        asteroids: asteroids
            .map(function (asteroid) { return ({
            vertices: asteroid.vertices.map(function (v) { return ({ x: v.x, y: v.y }); })
        }); }),
        explosions: explosions.map(function (explosion) { return ({
            position: explosion.position,
            radius: explosion.radius
        }); })
    };
}
