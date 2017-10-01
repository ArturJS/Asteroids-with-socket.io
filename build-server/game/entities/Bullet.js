//      
                                                      
                                                    

const {rotatePoint} = require('../helpers');

module.exports = class Bullet                    {
                   
                   
                   
                   
                     
               

  constructor({
    playerId,
    position,
    rotation
  }  
                     
                     
                    
   ) {
    let posDelta         = rotatePoint({x: 0, y: -20}, {x: 0, y: 0}, rotation * Math.PI / 180);

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

  destroy()       {
    this.isDeleted = true;
  }
};
