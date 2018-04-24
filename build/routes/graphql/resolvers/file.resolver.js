'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storeFile = exports.uploadFile = undefined;

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var uploadFile = exports.uploadFile = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, _ref2) {
    var file = _ref2.file;

    var _ref3, filename;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return file;

          case 2:
            _ref3 = _context.sent;
            filename = _ref3.filename;
            _context.next = 6;
            return _cloudinary2.default.v2.uploader.upload(filename, function (error, result) {
              if (result) {
                return result;
              } else if (error) {
                return error;
              }
            });

          case 6:
            return _context.abrupt('return', _context.sent);

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function uploadFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var storeFile = exports.storeFile = function storeFile(_ref4) {
  var stream = _ref4.stream,
      filename = _ref4.filename;

  var path = '' + _config2.default.uploadsFolder + filename;
  return new Promise(function (resolve, reject) {
    return stream.on('error', function (error) {
      if (stream.truncated)
        // Delete the truncated file
        _fs2.default.unlinkSync(path);
      reject(error);
    }).pipe(_fs2.default.createWriteStream(path)).on('error', function (error) {
      return reject(error);
    }).on('finish', function () {
      return resolve({ path: path });
    });
  });
};
//# sourceMappingURL=file.resolver.js.map