const shortid = require('shortid');
const _ = require('lodash');

module.exports = {
	getRooms: getRooms,
	getRoomById: getRoomById
};

///

let rooms = [
  {
    id: shortid.generate(),
    name: 'room1'
  },
  {
    id: shortid.generate(),
    name: 'room2'
  },
  {
    id: shortid.generate(),
    name: 'room3'
  }
];

function getRooms(req, res) {
  res.status(200).json(rooms.map(room => _.pick(room, ['id', 'name'])));
}

function getRoomById(req, res) {
  let {roomId} = req.params;
  let room = rooms.find(room => room.id === roomId);

  if (!room) {
    res.status(404).json({
      errors: [
        `No data available by roomId="${roomId}"`
      ]
    });
    return;
  }

  res.status(200).json(room);
}
