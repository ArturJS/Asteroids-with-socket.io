const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/config.js').jwtSecret;

module.exports = {
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
