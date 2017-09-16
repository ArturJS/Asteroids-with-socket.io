"use strict";
exports.__esModule = true;
var _ = require("lodash");
var shortid = require("shortid");
var Asteroid = (function () {
    function Asteroid(_a) {
        var id = _a.id, _b = _a.velocity, velocity = _b === void 0 ? null : _b, _c = _a.rotationSpeed, rotationSpeed = _c === void 0 ? null : _c, radius = _a.radius, _d = _a.vertices, vertices = _d === void 0 ? null : _d, _e = _a.center, center = _e === void 0 ? null : _e;
        this.id = id;
        this.radius = radius;
        this.velocity = velocity || {
            x: _.random(-1.5, 1.5),
            y: _.random(-1.5, 1.5)
        };
        this.rotationSpeed = rotationSpeed || _.random(-3.0, 3.0) * Math.PI / 180; //  * Math.PI / 180 <- degrees to radians
        this.vertices = vertices || _asteroidVertices(8, radius, center);
        this.isDeleted = false;
    }
    Asteroid.prototype.update = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.id, id = _c === void 0 ? null : _c, _d = _b.velocity, velocity = _d === void 0 ? null : _d, _e = _b.isDeleted, isDeleted = _e === void 0 ? null : _e, _f = _b.vertices, vertices = _f === void 0 ? null : _f, _g = _b.radius, radius = _g === void 0 ? null : _g, _h = _b.rotationSpeed, rotationSpeed = _h === void 0 ? null : _h;
        if (id) {
            this.id = id;
        }
        if (velocity) {
            this.velocity = velocity;
        }
        if (isDeleted) {
            this.isDeleted = isDeleted;
        }
        if (vertices) {
            this.vertices = vertices;
        }
        if (radius) {
            this.radius = radius;
        }
        if (rotationSpeed) {
            this.rotationSpeed = rotationSpeed;
        }
    };
    Asteroid.prototype.get = function () {
        return {
            id: this.id,
            center: this.center,
            velocity: this.velocity,
            isDeleted: this.isDeleted,
            vertices: this.vertices,
            radius: this.radius,
            rotationSpeed: this.rotationSpeed
        };
    };
    Asteroid.prototype.destroy = function () {
        var _this = this;
        this.isDeleted = true;
        var asteroidParticles = [];
        // Break into smaller asteroids
        if (this.radius > 10) {
            var center_1 = this.center;
            _.times(3, function () {
                asteroidParticles.push(new Asteroid({
                    id: shortid.generate(),
                    radius: _this.radius / 2,
                    center: {
                        x: _.random(-10, 20) + center_1.x,
                        y: _.random(-10, 20) + center_1.y
                    }
                }));
            });
        }
        return asteroidParticles;
    };
    Object.defineProperty(Asteroid.prototype, "id", {
        get: function () {
            return this._id;
        },
        set: function (value) {
            this._id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Asteroid.prototype, "center", {
        get: function () {
            return _compute2DPolygonCentroid(this.vertices);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Asteroid.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (value) {
            this._velocity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Asteroid.prototype, "isDeleted", {
        get: function () {
            return this._isDeleted;
        },
        set: function (value) {
            this._isDeleted = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Asteroid.prototype, "vertices", {
        get: function () {
            return this._vertices;
        },
        set: function (value) {
            this._vertices = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Asteroid.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        set: function (value) {
            this._radius = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Asteroid.prototype, "rotationSpeed", {
        get: function () {
            return this._rotationSpeed;
        },
        set: function (value) {
            this._rotationSpeed = value;
        },
        enumerable: true,
        configurable: true
    });
    return Asteroid;
}());
exports["default"] = Asteroid;
;
// private methods
function _asteroidVertices(count, radius, center) {
    var vertices = [];
    center = center || { x: 0, y: 0 };
    _.times(count, function (i) {
        vertices.push({
            x: (-Math.sin((360 / count) * i * Math.PI / 180)
                + Math.round(Math.random() * 2 - 1) * Math.random() / 3)
                * radius + center.x - radius,
            y: (-Math.cos((360 / count) * i * Math.PI / 180)
                + Math.round(Math.random() * 2 - 1) * Math.random() / 3)
                * radius + center.y - radius
        });
    });
    return vertices;
}
// taken from http://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon#answer-2792459
function _compute2DPolygonCentroid(vertices) {
    var centroid = { x: 0, y: 0 };
    var signedArea = 0.0;
    var x0 = 0.0; // Current vertex X
    var y0 = 0.0; // Current vertex Y
    var x1 = 0.0; // Next vertex X
    var y1 = 0.0; // Next vertex Y
    var a = 0.0; // Partial signed area
    var vertexCount = vertices.length;
    // For all vertices except last
    var i = 0;
    for (; i < vertexCount - 1; ++i) {
        x0 = vertices[i].x;
        y0 = vertices[i].y;
        x1 = vertices[i + 1].x;
        y1 = vertices[i + 1].y;
        a = x0 * y1 - x1 * y0;
        signedArea += a;
        centroid.x += (x0 + x1) * a;
        centroid.y += (y0 + y1) * a;
    }
    // Do last vertex separately to avoid performing an expensive
    // modulus operation in each iteration.
    x0 = vertices[i].x;
    y0 = vertices[i].y;
    x1 = vertices[0].x;
    y1 = vertices[0].y;
    a = x0 * y1 - x1 * y0;
    signedArea += a;
    centroid.x += (x0 + x1) * a;
    centroid.y += (y0 + y1) * a;
    signedArea *= 0.5;
    centroid.x /= (6.0 * signedArea);
    centroid.y /= (6.0 * signedArea);
    return centroid;
}
