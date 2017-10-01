const jwt = require('jsonwebtoken');
const config = require('../config/config');

const jwtSecret = config.jwtSecret;

module.exports = (controller, passIf = (_) => true) => {
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

    req.authData = _getAuthData(token);

    controller(req, res);
  };
};

///

function _isAuthorized(token) {
  try {
    _getAuthData(token);
    return true;
  }
  catch(err) {
    return false;
  }
}

function _getAuthData(token) {
  return jwt.verify(token, jwtSecret);
}
