//      

                                                          
                                                    

const _ = require('lodash');
const shortid = require('shortid');

module.exports = class Asteroid                      {
             
                   
                     
                        
                 
                     

  constructor({
    id,
    velocity,
    rotationSpeed,
    radius,
    center,
  }  
               
                      
                           
                   
                   
   ) {
    this.id = id;
    this.radius = radius;
    this.velocity = velocity || {
        x: _.random(-1.5, 1.5),
        y: _.random(-1.5, 1.5)
      };
    this.rotationSpeed = rotationSpeed || _.random(-3.0, 3.0) * Math.PI / 180; //  * Math.PI / 180 <- degrees to radians
    this.vertices = _asteroidVertices(8, radius, center);
    this.isDeleted = false;
  }

  destroy()              {
    this.isDeleted = true;

    let asteroidParticles              = [];

    // Break into smaller asteroids
    if (this.radius > 10) {
      let center = this.getCenter();

      _.times(3, ()       => {
        asteroidParticles.push(
          new Asteroid({
            id: shortid.generate(),
            radius: this.radius / 2,
            center: {
              x: _.random(-10, 20) + center.x,
              y: _.random(-10, 20) + center.y
            }
          })
        );
      });
    }

    return asteroidParticles;
  }

  getCenter()         {
    return _compute2DPolygonCentroid(this.vertices);
  }
};

// private methods

function _asteroidVertices(count        , radius        , center         = {x: 0, y: 0})           {
  let vertices           = [];

  _.times(count, (i        ) => {
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
function _compute2DPolygonCentroid(vertices          )         {
  let centroid         = {x: 0, y: 0};
  let signedArea         = 0.0;
  let x0         = 0.0; // Current vertex X
  let y0         = 0.0; // Current vertex Y
  let x1         = 0.0; // Next vertex X
  let y1         = 0.0; // Next vertex Y
  let a         = 0.0;  // Partial signed area

  let vertexCount         = vertices.length;

  // For all vertices except last
  let i         = 0;
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
