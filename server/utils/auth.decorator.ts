import * as jwt from 'jsonwebtoken';
import config from '../config/config';

const jwtSecret = config.jwtSecret;

export default (controller, passIf = (_) => true) => {
  return (req, res) => {
    const token = req.get('Authorization');

    if (!token || !_isAuthorized(token)) {
      res.status(401).json({
        errors: ['Unauthorized!']
      });
      return;
    }

    if (!passIf(req)) {
      res.status(401).json({
        errors: ['You have no access here!']
      });
      return;
    }

    controller(req, res);
  };
};

///

function _isAuthorized(token) {
  try {
    jwt.verify(token, jwtSecret);
    return true;
  }
  catch(err) {
    return false;
  }
}
