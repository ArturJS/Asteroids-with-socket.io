import * as _ from 'lodash';

export default class Asteroid {
  private _id;
  private _velocity;
  private _isDeleted;
  private _rotationSpeed;
  private _radius;
  private _vertices;

  constructor({
    id = null,
    velocity = null,
    rotationSpeed = null,
    radius = null,
    vertices = null,
  } = {}) {
    this.id = id;
    this.radius = radius;
    this.velocity = velocity || {
        x: _.random(-1.5, 1.5),
        y: _.random(-1.5, 1.5)
      };
    this.rotationSpeed = rotationSpeed || _.random(-3.0, 3.0) * Math.PI / 180; //  * Math.PI / 180 <- degrees to radians
    this.vertices = vertices || _asteroidVertices(8, radius);
  }

  update({
    id = null,
    velocity = null,
    isDeleted = null,
    vertices = null,
    radius = null,
    rotationSpeed = null
  } = {}) {
    if (id) {
      this.id= id;
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
  }

  get() {
    return {
      id: this.id,
      center: this.center,
      velocity: this.velocity,
      isDeleted: this.isDeleted,
      vertices: this.vertices,
      radius: this.radius,
      rotationSpeed: this.rotationSpeed
    }
  }

  destroy() {
    this.isDeleted = true;
  }


  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }


  get center() {
    return _compute2DPolygonCentroid(this.vertices);
  }


  get velocity() {
    return this._velocity;
  }

  set velocity(value) {
    this._velocity = value;
  }


  set isDeleted(value) {
    this._isDeleted = value;
  }

  get isDeleted() {
    return this._isDeleted;
  }


  get vertices() {
    return this._vertices;
  }

  set vertices(value) {
    this._vertices = value;
  }


  get radius() {
    return this._radius;
  }

  set radius(value) {
    this._radius = value;
  }


  get rotationSpeed() {
    return this._rotationSpeed;
  }

  set rotationSpeed(value) {
    this._rotationSpeed = value;
  }
};

// private methods

function _asteroidVertices(count, rad) {
  let vertices = [];

  for (let i = 0; i < count; i++) {
    vertices.push({
      x: (-Math.sin((360 / count) * i * Math.PI / 180) + Math.round(Math.random() * 2 - 1) * Math.random() / 3) * rad,
      y: (-Math.cos((360 / count) * i * Math.PI / 180) + Math.round(Math.random() * 2 - 1) * Math.random() / 3) * rad
    });
  }

  return vertices;
}

// taken from http://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon#answer-2792459
function _compute2DPolygonCentroid(vertices) {
  let centroid = {x: 0, y: 0};
  let signedArea = 0.0;
  let x0 = 0.0; // Current vertex X
  let y0 = 0.0; // Current vertex Y
  let x1 = 0.0; // Next vertex X
  let y1 = 0.0; // Next vertex Y
  let a = 0.0;  // Partial signed area

  let vertexCount = vertices.length;

  // For all vertices except last
  let i = 0;
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
