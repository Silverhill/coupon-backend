'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addImageToUser = exports.updatePassword = exports.signIn = exports.login = exports.signUp = exports.register = exports.myCoupons = exports.me = exports.getUser = exports.allHunters = exports.allMakers = exports.allUsers = undefined;

var loginUser = function () {
  var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(email, password, models) {
    var user, passwordIsValid, expiresIn, token;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return models.User.findOne({ email: email.toLowerCase() });

          case 2:
            user = _context14.sent;

            if (user) {
              _context14.next = 5;
              break;
            }

            throw new Error('Not user with that email.');

          case 5:
            passwordIsValid = user.authenticate(password);

            if (passwordIsValid) {
              _context14.next = 8;
              break;
            }

            throw new Error('Password is not correct.');

          case 8:
            expiresIn = '1y';

            if (user.role === 'admin') {
              expiresIn = 60 * 60 * 5;
            }

            token = _jsonwebtoken2.default.sign({ _id: user._id, role: user.role }, _config2.default.secrets.session, {
              expiresIn: expiresIn
            });
            return _context14.abrupt('return', token);

          case 12:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function loginUser(_x39, _x40, _x41) {
    return _ref38.apply(this, arguments);
  };
}();

var registerUser = function () {
  var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(_user, models) {
    var hasValidRole, user;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            hasValidRole = (0, _graphql.roleExist)(_user.role);

            _user.role = (_user.role || 'hunter').toLowerCase();

            if (hasValidRole) {
              _context15.next = 6;
              break;
            }

            throw new Error('Role is incorrect for the correct creation');

          case 6:
            if (!(_user.role === 'admin')) {
              _context15.next = 8;
              break;
            }

            throw new Error('You can not create users with admin role');

          case 8:
            user = void 0;

            if (!(_user.role === 'hunter')) {
              _context15.next = 13;
              break;
            }

            _context15.next = 12;
            return new models.Hunter(_user);

          case 12:
            user = _context15.sent;

          case 13:
            if (!(_user.role === 'maker')) {
              _context15.next = 17;
              break;
            }

            _context15.next = 16;
            return new models.Maker(_user);

          case 16:
            user = _context15.sent;

          case 17:
            user.provider = 'local';
            user.createdAt = new Date();
            user.updatedAt = new Date();
            _context15.next = 22;
            return user.save();

          case 22:
            user = _context15.sent;
            return _context15.abrupt('return', user);

          case 24:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));

  return function registerUser(_x42, _x43) {
    return _ref39.apply(this, arguments);
  };
}();

var createCompany = function () {
  var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(companyName, makerId, models) {
    var company, newCompany;
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            if (!companyName) {
              _context16.next = 16;
              break;
            }

            company = {
              businessName: companyName,
              createdAt: new Date(),
              updatedAt: new Date(),
              maker: makerId
            };
            _context16.next = 4;
            return new models.Company(company);

          case 4:
            newCompany = _context16.sent;
            _context16.prev = 5;
            _context16.next = 8;
            return newCompany.save();

          case 8:
            _context16.next = 10;
            return addCompanyToMaker(makerId, newCompany._id, models);

          case 10:
            return _context16.abrupt('return', newCompany);

          case 13:
            _context16.prev = 13;
            _context16.t0 = _context16['catch'](5);
            throw new Error(_context16.t0.message || _context16.t0);

          case 16:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, this, [[5, 13]]);
  }));

  return function createCompany(_x44, _x45, _x46) {
    return _ref40.apply(this, arguments);
  };
}();

var addCompanyToMaker = function () {
  var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(makerId, companyId, models) {
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.next = 2;
            return models.Maker.findByIdAndUpdate(makerId, {
              company: companyId,
              updatedAt: new Date()
            }, { new: true });

          case 2:
          case 'end':
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function addCompanyToMaker(_x47, _x48, _x49) {
    return _ref41.apply(this, arguments);
  };
}();
// User utils


var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _graphql = require('../../../services/graphql.service');

var _file = require('./file.resolver');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * QUERY
 */
var allUsers = exports.allUsers = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, _ref2, _ref3) {
    var _ref2$limit = _ref2.limit,
        limit = _ref2$limit === undefined ? 10 : _ref2$limit,
        _ref2$skip = _ref2.skip,
        skip = _ref2$skip === undefined ? 0 : _ref2$skip,
        _ref2$sortField = _ref2.sortField,
        sortField = _ref2$sortField === undefined ? 'createdAt' : _ref2$sortField,
        _ref2$sortDirection = _ref2.sortDirection,
        sortDirection = _ref2$sortDirection === undefined ? 1 : _ref2$sortDirection;
    var models = _ref3.models;
    var sortObject, total, users, returnObject;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            sortObject = {};

            sortObject[sortField] = sortDirection;
            _context.next = 4;
            return models.User.count({});

          case 4:
            total = _context.sent;
            _context.next = 7;
            return models.User.find({}, '-salt -password').limit(limit).skip(skip).sort(sortObject);

          case 7:
            users = _context.sent;
            returnObject = {
              users: users,
              totalCount: total
            };
            return _context.abrupt('return', returnObject);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function allUsers(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var allMakers = exports.allMakers = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(parent, _ref5, _ref6) {
    var _ref5$limit = _ref5.limit,
        limit = _ref5$limit === undefined ? 10 : _ref5$limit,
        _ref5$skip = _ref5.skip,
        skip = _ref5$skip === undefined ? 0 : _ref5$skip,
        _ref5$sortField = _ref5.sortField,
        sortField = _ref5$sortField === undefined ? 'createdAt' : _ref5$sortField,
        _ref5$sortDirection = _ref5.sortDirection,
        sortDirection = _ref5$sortDirection === undefined ? 1 : _ref5$sortDirection;
    var models = _ref6.models;
    var sortObject, total, users, returnObject;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            sortObject = {};

            sortObject[sortField] = sortDirection;
            _context2.next = 4;
            return models.User.count({ '_type': 'Maker' });

          case 4:
            total = _context2.sent;
            _context2.next = 7;
            return models.User.find({ '_type': 'Maker' }, '-salt -password').limit(limit).skip(skip).sort(sortObject);

          case 7:
            users = _context2.sent;
            returnObject = {
              makers: users,
              totalCount: total
            };
            return _context2.abrupt('return', returnObject);

          case 10:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function allMakers(_x4, _x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}();

var allHunters = exports.allHunters = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(parent, _ref8, _ref9) {
    var _ref8$limit = _ref8.limit,
        limit = _ref8$limit === undefined ? 10 : _ref8$limit,
        _ref8$skip = _ref8.skip,
        skip = _ref8$skip === undefined ? 0 : _ref8$skip,
        _ref8$sortField = _ref8.sortField,
        sortField = _ref8$sortField === undefined ? 'createdAt' : _ref8$sortField,
        _ref8$sortDirection = _ref8.sortDirection,
        sortDirection = _ref8$sortDirection === undefined ? 1 : _ref8$sortDirection;
    var models = _ref9.models;
    var sortObject, total, users, returnObject;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            sortObject = {};

            sortObject[sortField] = sortDirection;
            _context3.next = 4;
            return models.User.count({ '_type': 'Hunter' });

          case 4:
            total = _context3.sent;
            _context3.next = 7;
            return models.User.find({ '_type': 'Hunter' }, '-salt -password').limit(limit).skip(skip).sort(sortObject);

          case 7:
            users = _context3.sent;
            returnObject = {
              hunters: users,
              totalCount: total
            };
            return _context3.abrupt('return', returnObject);

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function allHunters(_x7, _x8, _x9) {
    return _ref7.apply(this, arguments);
  };
}();

var getUser = exports.getUser = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(parent, args, _ref11) {
    var models = _ref11.models;
    var id, user;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            id = args.id;
            _context4.next = 3;
            return models.User.findOne({ _id: id }, '-salt -password');

          case 3:
            user = _context4.sent;
            return _context4.abrupt('return', user);

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function getUser(_x10, _x11, _x12) {
    return _ref10.apply(this, arguments);
  };
}();

var me = exports.me = function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(parent, args, _ref13) {
    var models = _ref13.models,
        request = _ref13.request;

    var token, _ref14, userId, role, user;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            token = request.headers.authentication;
            _context5.next = 3;
            return extractUserInfoFromToken(token);

          case 3:
            _ref14 = _context5.sent;
            userId = _ref14.id;
            role = _ref14.role;
            user = void 0;

            if (!(role === 'hunter')) {
              _context5.next = 13;
              break;
            }

            _context5.next = 10;
            return models.Hunter.findOne({ _id: userId }, '-salt -password').populate('coupons');

          case 10:
            user = _context5.sent;
            _context5.next = 23;
            break;

          case 13:
            if (!(role === 'maker')) {
              _context5.next = 19;
              break;
            }

            _context5.next = 16;
            return models.Maker.findOne({ _id: userId }, '-salt -password').populate('campaigns');

          case 16:
            user = _context5.sent;
            _context5.next = 23;
            break;

          case 19:
            if (!(role === 'admin')) {
              _context5.next = 23;
              break;
            }

            _context5.next = 22;
            return models.User.findOne({ _id: userId }, '-salt -password');

          case 22:
            user = _context5.sent;

          case 23:
            return _context5.abrupt('return', user);

          case 24:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function me(_x13, _x14, _x15) {
    return _ref12.apply(this, arguments);
  };
}();

var myCoupons = exports.myCoupons = function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(parent, args, _ref16) {
    var models = _ref16.models,
        request = _ref16.request;

    var token, _ref17, id, _ref18, coupons, myCouponsInfo;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            token = request.headers.authentication;
            _context6.next = 3;
            return extractUserInfoFromToken(token);

          case 3:
            _ref17 = _context6.sent;
            id = _ref17.id;
            _context6.next = 7;
            return models.Hunter.findOne({ _id: id });

          case 7:
            _ref18 = _context6.sent;
            coupons = _ref18.coupons;
            _context6.next = 11;
            return models.Coupon.find({ _id: { "$in": coupons } }).populate({
              path: 'campaign',
              select: '-coupons',
              populate: {
                path: 'maker',
                select: '-campaigns'
              }
            });

          case 11:
            myCouponsInfo = _context6.sent;
            return _context6.abrupt('return', myCouponsInfo);

          case 13:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function myCoupons(_x16, _x17, _x18) {
    return _ref15.apply(this, arguments);
  };
}();

/**
 * MUTATIONS
 */

var register = exports.register = function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(parent, _ref20, _ref21) {
    var _user = _ref20.user;
    var models = _ref21.models;
    var res;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return registerUser(_user, models);

          case 3:
            res = _context7.sent;
            return _context7.abrupt('return', res);

          case 7:
            _context7.prev = 7;
            _context7.t0 = _context7['catch'](0);
            return _context7.abrupt('return', _context7.t0);

          case 10:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined, [[0, 7]]);
  }));

  return function register(_x19, _x20, _x21) {
    return _ref19.apply(this, arguments);
  };
}();

var signUp = exports.signUp = function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(parent, args, _ref23) {
    var models = _ref23.models;

    var _user, companyName, res, newCompany;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _user = args.input;
            companyName = _user.company;


            if (_user.company) {
              delete _user.company;
            }

            _context8.prev = 3;
            _context8.next = 6;
            return registerUser(_user, models);

          case 6:
            res = _context8.sent;

            if (!(res.role == 'maker')) {
              _context8.next = 14;
              break;
            }

            _context8.next = 10;
            return createCompany(companyName, res._id, models);

          case 10:
            newCompany = _context8.sent;
            _context8.next = 13;
            return models.Maker.findByIdAndUpdate(res._id, {
              company: newCompany._id,
              updatedAt: new Date()
            }, { new: true });

          case 13:
            res = _context8.sent;

          case 14:
            return _context8.abrupt('return', res);

          case 17:
            _context8.prev = 17;
            _context8.t0 = _context8['catch'](3);
            return _context8.abrupt('return', _context8.t0);

          case 20:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined, [[3, 17]]);
  }));

  return function signUp(_x22, _x23, _x24) {
    return _ref22.apply(this, arguments);
  };
}();

var login = exports.login = function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(parent, _ref25, _ref26) {
    var email = _ref25.email,
        password = _ref25.password;
    var models = _ref26.models;
    var token;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return loginUser(email, password, models);

          case 3:
            token = _context9.sent;
            return _context9.abrupt('return', token);

          case 7:
            _context9.prev = 7;
            _context9.t0 = _context9['catch'](0);
            return _context9.abrupt('return', _context9.t0);

          case 10:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined, [[0, 7]]);
  }));

  return function login(_x25, _x26, _x27) {
    return _ref24.apply(this, arguments);
  };
}();

var signIn = exports.signIn = function () {
  var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(parent, args, _ref28) {
    var models = _ref28.models;
    var email, password, token;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            email = args.email, password = args.password;
            _context10.prev = 1;
            _context10.next = 4;
            return loginUser(email, password, models);

          case 4:
            token = _context10.sent;
            return _context10.abrupt('return', {
              token: token
            });

          case 8:
            _context10.prev = 8;
            _context10.t0 = _context10['catch'](1);
            return _context10.abrupt('return', _context10.t0);

          case 11:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, undefined, [[1, 8]]);
  }));

  return function signIn(_x28, _x29, _x30) {
    return _ref27.apply(this, arguments);
  };
}();

var updatePassword = exports.updatePassword = function () {
  var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(parent, args, _ref30) {
    var models = _ref30.models,
        request = _ref30.request;

    var input, authentication, oldPass, newPass, _jwt$verify, _id, user;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            input = args.input;
            authentication = request.headers.authentication;

            if (authentication) {
              _context11.next = 4;
              break;
            }

            throw new Error('You need logged to changue password');

          case 4:
            oldPass = input.oldPass.toString().trim();
            newPass = input.newPass.toString().trim();
            _jwt$verify = _jsonwebtoken2.default.verify(authentication, _config2.default.secrets.session), _id = _jwt$verify._id;
            _context11.next = 9;
            return models.User.findById(_id);

          case 9:
            user = _context11.sent;

            if (!user.authenticate(oldPass)) {
              _context11.next = 18;
              break;
            }

            user.password = newPass;
            user.updatedAt = new Date();
            _context11.next = 15;
            return user.save();

          case 15:
            user = _context11.sent;
            _context11.next = 19;
            break;

          case 18:
            throw new Error('Problem to changue the password');

          case 19:
            return _context11.abrupt('return', user);

          case 20:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, undefined);
  }));

  return function updatePassword(_x31, _x32, _x33) {
    return _ref29.apply(this, arguments);
  };
}();

var addImageToUser = exports.addImageToUser = function () {
  var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(parent, _ref32, _ref33) {
    var upload = _ref32.upload;
    var models = _ref33.models,
        request = _ref33.request;

    var _ref34, stream, filename, token, _ref35, id, user, _ref36, path;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return upload;

          case 2:
            _ref34 = _context13.sent;
            stream = _ref34.stream;
            filename = _ref34.filename;
            token = request.headers.authentication;
            _context13.next = 8;
            return extractUserInfoFromToken(token);

          case 8:
            _ref35 = _context13.sent;
            id = _ref35.id;
            _context13.next = 12;
            return models.User.findOne({ _id: id });

          case 12:
            user = _context13.sent;
            _context13.next = 15;
            return (0, _file.storeFile)({ stream: stream, filename: filename });

          case 15:
            _ref36 = _context13.sent;
            path = _ref36.path;
            _context13.next = 19;
            return _cloudinary2.default.v2.uploader.upload(path, function () {
              var _ref37 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(error, result) {
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        if (!result) {
                          _context12.next = 9;
                          break;
                        }

                        user.image = result.url;
                        user.updatedAt = new Date();
                        _fs2.default.unlinkSync(path);
                        _context12.next = 6;
                        return user.save();

                      case 6:
                        user = _context12.sent;
                        _context12.next = 11;
                        break;

                      case 9:
                        if (!error) {
                          _context12.next = 11;
                          break;
                        }

                        return _context12.abrupt('return', error);

                      case 11:
                      case 'end':
                        return _context12.stop();
                    }
                  }
                }, _callee12, undefined);
              }));

              return function (_x37, _x38) {
                return _ref37.apply(this, arguments);
              };
            }());

          case 19:
            return _context13.abrupt('return', user);

          case 20:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, undefined);
  }));

  return function addImageToUser(_x34, _x35, _x36) {
    return _ref31.apply(this, arguments);
  };
}();

var extractUserInfoFromToken = function () {
  var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(token) {
    var _ref43, _id, role;

    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.prev = 0;
            _context18.next = 3;
            return _jsonwebtoken2.default.verify(token, _config2.default.secrets.session);

          case 3:
            _ref43 = _context18.sent;
            _id = _ref43._id;
            role = _ref43.role;
            return _context18.abrupt('return', { id: _id, role: role });

          case 9:
            _context18.prev = 9;
            _context18.t0 = _context18['catch'](0);
            return _context18.abrupt('return', null);

          case 12:
          case 'end':
            return _context18.stop();
        }
      }
    }, _callee18, undefined, [[0, 9]]);
  }));

  return function extractUserInfoFromToken(_x50) {
    return _ref42.apply(this, arguments);
  };
}();
//# sourceMappingURL=user.resolver.js.map