"use strict";
exports.__esModule = true;
var entities_1 = require("./entities");
var _ = require("lodash");
exports["default"] = {
    getStorageData: getStorageData,
    setStorageData: setStorageData,
    updateKeys: updateKeys,
    addShip: addShip,
    removeShip: removeShip
};
///
var _playersMap = new Map();
var _roomBattleMap = new Map();
var _asteroidsMap = new Map();
function getStorageData() {
    return {
        playersMap: _playersMap,
        roomBattleMap: _roomBattleMap,
        asteroidsMap: _asteroidsMap
    };
}
function setStorageData(_a) {
    var playersMap = _a.playersMap, roomBattleMap = _a.roomBattleMap, asteroidsMap = _a.asteroidsMap;
    _playersMap = playersMap;
    _roomBattleMap = roomBattleMap;
    _asteroidsMap = asteroidsMap;
}
function updateKeys(playerId, keys) {
    if (_playersMap.has(playerId)) {
        _playersMap.get(playerId).keys = keys;
    }
}
function addShip(_a, roomId) {
    var playerId = _a.playerId, login = _a.login;
    _playersMap.set(playerId, {
        id: playerId,
        login: login,
        ship: new entities_1.Ship({ playerId: playerId }),
        keys: {
            left: 0,
            right: 0,
            up: 0,
            space: 0
        },
        score: 0,
        bullets: []
    });
    if (!_roomBattleMap.has(roomId)) {
        _roomBattleMap.set(roomId, {
            id: roomId,
            playerIds: [],
            asteroidIds: [],
            explosions: []
        });
    }
    _roomBattleMap.get(roomId).playerIds.push(playerId);
}
function removeShip(playerId, roomId) {
    _playersMap["delete"](playerId);
    if (!_roomBattleMap.has(roomId))
        return;
    _.remove(_roomBattleMap.get(roomId).playerIds, function (pId) { return pId === playerId; });
    if (_roomBattleMap.get(roomId).playerIds.length === 0) {
        var asteroidIds = _roomBattleMap.get(roomId).asteroidIds;
        _.each(asteroidIds, function (asteroidId) { return _asteroidsMap["delete"](asteroidId); });
        _roomBattleMap["delete"](roomId);
    }
}
