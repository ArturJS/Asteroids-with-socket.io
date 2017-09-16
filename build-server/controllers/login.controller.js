"use strict";
exports.__esModule = true;
var shortid = require("shortid");
var jwt = require("jsonwebtoken");
var config_1 = require("../config/config");
var auth_decorator_1 = require("../utils/auth.decorator");
var rooms_storage_1 = require("../storages/rooms.storage");
var jwtSecret = config_1["default"].jwtSecret;
exports["default"] = {
    doSignIn: doSignIn,
    doSignOut: auth_decorator_1["default"](doSignOut)
};
///
function doSignIn(req, res) {
    var login = req.body.login;
    var userId = shortid.generate();
    var token = jwt.sign({
        login: login,
        userId: userId
    }, jwtSecret);
    res.status(200).json({
        login: login,
        userId: userId,
        token: token
    });
}
function doSignOut(req, res) {
    var userId = req.authData.userId;
    rooms_storage_1["default"].deleteRoomsByUserId(userId);
    res.status(200).json({});
}
