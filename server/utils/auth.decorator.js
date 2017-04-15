const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/config.js').jwtSecret;

module.exports = (controller, passIf = () => true) => {
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
