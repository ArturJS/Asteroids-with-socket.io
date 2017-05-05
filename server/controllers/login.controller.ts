import * as shortid from 'shortid';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';

const {jwtSecret} = config;

export default {
  doSignIn
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
