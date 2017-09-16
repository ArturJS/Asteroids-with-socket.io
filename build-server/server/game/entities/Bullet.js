"use strict";
exports.__esModule = true;
var helpers_1 = require("../helpers");
var Bullet = (function () {
    function Bullet(_a) {
        var playerId = _a.playerId, position = _a.position, rotation = _a.rotation;
        var posDelta = helpers_1.rotatePoint({ x: 0, y: -20 }, { x: 0, y: 0 }, rotation * Math.PI / 180);
        this.playerId = playerId;
        this.position = {
            x: position.x + posDelta.x,
            y: position.y + posDelta.y
        };
        this.rotation = rotation;
        this.velocity = {
            x: posDelta.x / 2,
            y: posDelta.y / 2
        };
        this.isDeleted = false;
        this.date = Date.now();
    }
    Bullet.prototype.update = function (_a) {
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
    Bullet.prototype.get = function () {
        return {
            playerId: this.playerId,
            position: this.position,
            rotation: this.rotation,
            velocity: this.velocity,
            isDeleted: this.isDeleted,
            date: this.date
        };
    };
    Bullet.prototype.destroy = function () {
        this.isDeleted = true;
    };
    Object.defineProperty(Bullet.prototype, "playerId", {
        get: function () {
            return this._playerId;
        },
        set: function (value) {
            this._playerId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bullet.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bullet.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bullet.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (value) {
            this._velocity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bullet.prototype, "isDeleted", {
        get: function () {
            return this._isDeleted;
        },
        set: function (value) {
            this._isDeleted = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bullet.prototype, "date", {
        get: function () {
            return this._date;
        },
        set: function (value) {
            this._date = value;
        },
        enumerable: true,
        configurable: true
    });
    return Bullet;
}());
exports["default"] = Bullet;
;
