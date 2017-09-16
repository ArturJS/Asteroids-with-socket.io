"use strict";
exports.__esModule = true;
var _ = require("lodash");
var helpers_1 = require("../helpers");
var Ship = (function () {
    function Ship(_a) {
        var playerId = _a.playerId, _b = _a.position, position = _b === void 0 ? null : _b, _c = _a.rotation, rotation = _c === void 0 ? null : _c, _d = _a.velocity, velocity = _d === void 0 ? null : _d;
        this.playerId = playerId;
        this.position = position || {
            x: 450,
            y: 300
        };
        this.rotation = rotation || 0;
        this.velocity = velocity || {
            x: 0,
            y: 0
        };
    }
    Ship.prototype.update = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.position, position = _c === void 0 ? null : _c, _d = _b.rotation, rotation = _d === void 0 ? null : _d, _e = _b.velocity, velocity = _e === void 0 ? null : _e;
        if (position) {
            this.position = position;
        }
        if (rotation) {
            this.rotation = rotation;
        }
        if (velocity) {
            this.velocity = velocity;
        }
    };
    Ship.prototype.get = function () {
        return {
            playerId: this.playerId,
            position: this.position,
            rotation: this.rotation,
            velocity: this.velocity
        };
    };
    Object.defineProperty(Ship.prototype, "vertices", {
        get: function () {
            var pos = this.position;
            var rotation = this.rotation;
            var vertices = [
                {
                    x: pos.x,
                    y: pos.y - 15
                },
                {
                    x: pos.x - 10,
                    y: pos.y + 10
                },
                {
                    x: pos.x - 5,
                    y: pos.y + 7
                },
                {
                    x: pos.x + 5,
                    y: pos.y + 7
                },
                {
                    x: pos.x + 10,
                    y: pos.y + 10
                }
            ];
            _.each(vertices, function (point) {
                var _a = helpers_1.rotatePoint(point, pos, rotation), x = _a.x, y = _a.y;
                point.x = x;
                point.y = y;
            });
            return vertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ship.prototype, "playerId", {
        get: function () {
            return this._playerId;
        },
        set: function (value) {
            this._playerId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ship.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ship.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ship.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (value) {
            this._velocity = value;
        },
        enumerable: true,
        configurable: true
    });
    return Ship;
}());
exports["default"] = Ship;
;
