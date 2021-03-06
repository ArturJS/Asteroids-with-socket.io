//      
                                                    
                                                  

const _ = require('lodash');
const {rotatePoint} = require('../helpers');

module.exports = class Ship                  {
                   
                   
                   
                   

  constructor({
    playerId,
    position,
    rotation,
    velocity
  }  
                     
                      
                      
                     
   ) {
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

  getVertices()           {
    let pos         = this.position;
    let rotation         = this.rotation;
    let vertices           = [
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

    vertices.forEach((point        )       => {
      let {
        x, y
      }                         = rotatePoint(point, pos, rotation);
      point.x = x;
      point.y = y;
    });

    return vertices;
  }
};
