'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validationError = validationError;
function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    return res.status(statusCode).json(err);
  };
}
//# sourceMappingURL=common.service.js.map