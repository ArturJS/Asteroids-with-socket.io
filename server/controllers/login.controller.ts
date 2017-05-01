import * as shortid from 'shortid';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';

const jwtSecret = config.jwtSecret;

export default {
  doSignIn
};

///

function doSignIn(req, res) {
  const {
    login
  } = req.body;

  const token = jwt.sign({
    login,
    userId: shortid.generate()
  }, jwtSecret);

  res.status(200).json({
    login,
    token
  });
}
