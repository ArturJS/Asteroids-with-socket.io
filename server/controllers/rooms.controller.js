const shortid = require('shortid');
const _ = require('lodash');

module.exports = {
	getRooms: getRooms,
	getRoomById: getRoomById,
  createRoom: createRoom
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

function createRoom(req, res) {
  let {roomName} = req.body;
  let room = rooms.find(room => room.name === roomName);

  if (!room) {
    const newRoom = {
      id: shortid.generate(),
      name: roomName
    };

    rooms.push(newRoom);

    res.status(200).json(newRoom);
    return;
  }

  res.status(400).json({
    errors: ['Room with the same name already exists!']
  });
}
