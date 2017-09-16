"use strict";
exports.__esModule = true;
function rotatePoint(p, center, angle) {
    return {
        x: ((p.x - center.x) * Math.cos(angle) - (p.y - center.y) * Math.sin(angle)) + center.x,
        y: ((p.x - center.x) * Math.sin(angle) + (p.y - center.y) * Math.cos(angle)) + center.y
    };
}
exports.rotatePoint = rotatePoint;
