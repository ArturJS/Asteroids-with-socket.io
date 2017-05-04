import * as _ from 'lodash';

export default class Asteroid implements IAsteroid {
  private _id: string;
  private _velocity: IPoint;
  private _isDeleted: boolean;
  private _rotationSpeed: number;
  private _radius: number;
  private _vertices: IPoint[];

  constructor({
    id,
    velocity = null,
    rotationSpeed = null,
    radius,
    vertices = null,
  }:{
    id: string,
    velocity?: IPoint,
    rotationSpeed?: number,
    radius: number,
    vertices?: IPoint[]
  }) {
    this.id = id;
    this.radius = radius;
    this.velocity = velocity || {
        x: _.random(-1.5, 1.5),
        y: _.random(-1.5, 1.5)
      };
    this.rotationSpeed = rotationSpeed || _.random(-3.0, 3.0) * Math.PI / 180; //  * Math.PI / 180 <- degrees to radians
    this.vertices = vertices || _asteroidVertices(8, radius);
    this.isDeleted = false;
  }

  update({
    id = null,
    velocity = null,
    isDeleted = null,
    vertices = null,
    radius = null,
    rotationSpeed = null
  }:{
    id?: string,
    velocity?: IPoint,
    isDeleted?: boolean,
    vertices?: IPoint[],
    radius?: number,
    rotationSpeed?: number
  } = {}): void {
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
  }

  get(): IAsteroid {
    return {
      id: this.id,
      center: this.center,
      velocity: this.velocity,
      isDeleted: this.isDeleted,
      vertices: this.vertices,
      radius: this.radius,
      rotationSpeed: this.rotationSpeed
    };
  }

  destroy(): void {
    this.isDeleted = true;
  }


  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }


  get center(): IPoint {
    return _compute2DPolygonCentroid(this.vertices);
  }


  get velocity(): IPoint {
    return this._velocity;
  }

  set velocity(value: IPoint) {
    this._velocity = value;
  }


  get isDeleted(): boolean {
    return this._isDeleted;
  }

  set isDeleted(value: boolean) {
    this._isDeleted = value;
  }


  get vertices(): IPoint[] {
    return this._vertices;
  }

  set vertices(value: IPoint[]) {
    this._vertices = value;
  }


  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
  }


  get rotationSpeed(): number {
    return this._rotationSpeed;
  }

  set rotationSpeed(value: number) {
    this._rotationSpeed = value;
  }
};

// private methods

function _asteroidVertices(count: number, radius: number): IPoint[] {
  let vertices: IPoint[] = [];

  _.times(count, (i: number) => {
    vertices.push({
      x: (-Math.sin((360 / count) * i * Math.PI / 180) + Math.round(Math.random() * 2 - 1) * Math.random() / 3) * radius,
      y: (-Math.cos((360 / count) * i * Math.PI / 180) + Math.round(Math.random() * 2 - 1) * Math.random() / 3) * radius
    });
  });

  return vertices;
}

// taken from http://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon#answer-2792459
function _compute2DPolygonCentroid(vertices: IPoint[]): IPoint {
  let centroid: IPoint = {x: 0, y: 0};
  let signedArea: number = 0.0;
  let x0: number = 0.0; // Current vertex X
  let y0: number = 0.0; // Current vertex Y
  let x1: number = 0.0; // Next vertex X
  let y1: number = 0.0; // Next vertex Y
  let a: number = 0.0;  // Partial signed area

  let vertexCount: number = vertices.length;

  // For all vertices except last
  let i: number = 0;
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
