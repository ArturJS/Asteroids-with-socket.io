import * as shortid from 'shortid';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import authDecorator from '../utils/auth.decorator';
import roomsStorage from '../storages/rooms.storage';

const {jwtSecret} = config;

export default {
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
