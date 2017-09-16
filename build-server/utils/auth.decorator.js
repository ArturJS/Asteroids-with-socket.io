"use strict";
exports.__esModule = true;
var jwt = require("jsonwebtoken");
var config_1 = require("../config/config");
var jwtSecret = config_1["default"].jwtSecret;
exports["default"] = function (controller, passIf) {
    if (passIf === void 0) { passIf = function (_) { return true; }; }
    return function (req, res) {
        var token = req.get('Authorization');
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
    catch (err) {
        return false;
    }
}
function _getAuthData(token) {
    return jwt.verify(token, jwtSecret);
}
