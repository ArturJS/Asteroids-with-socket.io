const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const authDecorator = require('../utils/auth.decorator');
const roomsStorage = require('../storages/rooms.storage');

const {jwtSecret} = config;

module.exports = {
  doSignIn,
  doSignOut: authDecorator(doSignOut)
};

///

function doSignIn(req, res) {
  const {
    login
  } = req.body;

  let userId = shortid.generate();

  const token = jwt.sign({
    login,
    userId
  }, jwtSecret);

  res.status(200).json({
    login,
    userId,
    token
  });
}

function doSignOut(req, res) {
  let {userId} = req.authData;

  roomsStorage.deleteRoomsByUserId(userId);

  res.status(200).json({});
}
