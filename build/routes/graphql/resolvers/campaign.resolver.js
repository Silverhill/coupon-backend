'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.campaignsByMakerId = exports.getHuntersByCampaign = exports.getCouponsFromCampaign = exports.getCampaign = exports.deleteCampaign = exports.updateCampaign = exports.addCampaign = exports.myCampaigns = exports.allCampaigns = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var addCouponsToCampaign = function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(quantity, campaignId, models) {
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return createCouponsRecursively(quantity, models, campaignId);

          case 2:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function addCouponsToCampaign(_x28, _x29, _x30) {
    return _ref18.apply(this, arguments);
  };
}();

var createCouponsRecursively = function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(maxQuantity, models, campaignId) {
    var code, coupon, newCoupon;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!(maxQuantity > 0)) {
              _context11.next = 19;
              break;
            }

            code = _crypto2.default.randomBytes(10).toString('hex');
            coupon = {
              code: code,
              status: 'available',
              createdAt: new Date(),
              updatedAt: new Date(),
              campaign: campaignId
            };
            _context11.prev = 3;
            _context11.next = 6;
            return new models.Coupon(coupon);

          case 6:
            newCoupon = _context11.sent;
            _context11.next = 9;
            return newCoupon.save();

          case 9:
            _context11.next = 11;
            return models.Campaign.findByIdAndUpdate(campaignId, {
              '$push': { 'coupons': newCoupon._id },
              updatedAt: new Date()
            }, { new: true });

          case 11:

            maxQuantity = maxQuantity - 1;
            _context11.next = 14;
            return createCouponsRecursively(maxQuantity, models, campaignId);

          case 14:
            _context11.next = 19;
            break;

          case 16:
            _context11.prev = 16;
            _context11.t0 = _context11['catch'](3);
            throw new Error(_context11.t0.message || _context11.t0);

          case 19:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this, [[3, 16]]);
  }));

  return function createCouponsRecursively(_x31, _x32, _x33) {
    return _ref19.apply(this, arguments);
  };
}();

var getOffice = function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(makerId, officeId, models) {
    var company, office;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return models.Company.findOne({ maker: makerId });

          case 2:
            company = _context12.sent;
            _context12.next = 5;
            return models.Office.findOne({
              _id: officeId,
              company: company._id
            });

          case 5:
            office = _context12.sent;
            return _context12.abrupt('return', office);

          case 7:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function getOffice(_x34, _x35, _x36) {
    return _ref20.apply(this, arguments);
  };
}();

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _model = require('../../../services/model.service');

var _file = require('./file.resolver');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var allCampaigns = exports.allCampaigns = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, _ref2, context) {
    var _ref2$limit = _ref2.limit,
        limit = _ref2$limit === undefined ? 10 : _ref2$limit,
        _ref2$skip = _ref2.skip,
        skip = _ref2$skip === undefined ? 0 : _ref2$skip,
        _ref2$sortField = _ref2.sortField,
        sortField = _ref2$sortField === undefined ? 'createdAt' : _ref2$sortField,
        _ref2$sortDirection = _ref2.sortDirection,
        sortDirection = _ref2$sortDirection === undefined ? 1 : _ref2$sortDirection;
    var models, request, sortObject, authentication, hunterId, hunter, mycampaigns, numberOfHuntedCoupons, total, campaigns, campaignsWithDetails, returnObject;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            models = context.models, request = context.request;
            sortObject = {};

            sortObject[sortField] = sortDirection;
            authentication = request.headers.authentication;
            _context.next = 6;
            return (0, _model.extractUserIdFromToken)(authentication);

          case 6:
            hunterId = _context.sent;
            _context.next = 9;
            return models.Hunter.findOne({ _id: hunterId }).populate('coupons');

          case 9:
            hunter = _context.sent;
            _context.next = 12;
            return models.Campaign.find({
              coupons: { '$in': hunter.coupons }
            }).populate('coupons');

          case 12:
            mycampaigns = _context.sent;
            numberOfHuntedCoupons = getCampaignsWithHuntedCoupons(mycampaigns, hunter.coupons);
            _context.next = 16;
            return models.Campaign.count({});

          case 16:
            total = _context.sent;
            _context.next = 19;
            return models.Campaign.find({}).limit(limit).skip(skip).sort(sortObject).populate('coupons').populate('maker');

          case 19:
            campaigns = _context.sent;
            campaignsWithDetails = addCouponsHuntedByMe(campaigns, mycampaigns, numberOfHuntedCoupons);
            returnObject = {
              campaigns: campaignsWithDetails,
              totalCount: total
            };
            return _context.abrupt('return', returnObject);

          case 23:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function allCampaigns(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var myCampaigns = exports.myCampaigns = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(parent, args, _ref4) {
    var models = _ref4.models,
        request = _ref4.request;

    var authentication, _ref5, _id, campaigns;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            authentication = request.headers.authentication;

            if (authentication) {
              _context2.next = 3;
              break;
            }

            throw new Error('You need logged to get campaigns');

          case 3:
            _context2.next = 5;
            return _jsonwebtoken2.default.verify(authentication, _config2.default.secrets.session);

          case 5:
            _ref5 = _context2.sent;
            _id = _ref5._id;
            _context2.next = 9;
            return models.Campaign.find({ maker: _id }, '-coupons').populate('office');

          case 9:
            campaigns = _context2.sent;
            return _context2.abrupt('return', campaigns);

          case 11:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function myCampaigns(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

// TODO: Actualizar el estado (status) de la campaña acorde a las necesidades
var addCampaign = exports.addCampaign = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(parent, args, context) {
    var models, request, input, authentication, makerId, office, couponsNumber, campaign, _ref7, stream, filename, _ref8, path, newCampaign, campaignId, campaignUpdated;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            models = context.models, request = context.request;
            input = args.input;
            authentication = request.headers.authentication;

            validateRange(input);
            _context3.next = 6;
            return (0, _model.extractUserIdFromToken)(authentication);

          case 6:
            makerId = _context3.sent;
            _context3.next = 9;
            return getOffice(makerId, input.officeId, models);

          case 9:
            office = _context3.sent;

            if (office) {
              _context3.next = 12;
              break;
            }

            throw Error('Invalid office Id');

          case 12:
            couponsNumber = input.couponsNumber;
            campaign = _extends({}, input, {
              createdAt: new Date(),
              updatedAt: new Date(),
              totalCoupons: couponsNumber,
              maker: makerId,
              office: office._id
            });

            if (!campaign.upload) {
              _context3.next = 26;
              break;
            }

            _context3.next = 17;
            return campaign.upload;

          case 17:
            _ref7 = _context3.sent;
            stream = _ref7.stream;
            filename = _ref7.filename;
            _context3.next = 22;
            return (0, _file.storeFile)({ stream: stream, filename: filename });

          case 22:
            _ref8 = _context3.sent;
            path = _ref8.path;
            _context3.next = 26;
            return _cloudinary2.default.v2.uploader.upload(path, function (error, result) {
              if (result) {
                campaign.image = result.url;
                _fs2.default.unlinkSync(path);
              } else if (error) {
                return error;
              }
            });

          case 26:
            _context3.next = 28;
            return new models.Campaign(campaign);

          case 28:
            newCampaign = _context3.sent;
            _context3.prev = 29;
            _context3.next = 32;
            return newCampaign.save();

          case 32:
            campaignId = newCampaign._id;
            _context3.next = 35;
            return addCouponsToCampaign(couponsNumber, campaignId, models);

          case 35:
            _context3.next = 37;
            return updateRelatedModels({
              officeId: office._id,
              campaignId: campaignId,
              models: models,
              makerId: makerId
            });

          case 37:
            _context3.next = 39;
            return models.Campaign.findOne({ _id: campaignId }, '-coupons').populate('office');

          case 39:
            campaignUpdated = _context3.sent;
            return _context3.abrupt('return', campaignUpdated);

          case 43:
            _context3.prev = 43;
            _context3.t0 = _context3['catch'](29);

            newCampaign.remove();
            throw new Error(_context3.t0.message || _context3.t0);

          case 47:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[29, 43]]);
  }));

  return function addCampaign(_x7, _x8, _x9) {
    return _ref6.apply(this, arguments);
  };
}();

var updateCampaign = exports.updateCampaign = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(parent, args, context) {
    var models, input, campaign, updatedCampaign;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            models = context.models;
            input = args.input;


            validateRange(input);

            _context4.prev = 3;
            campaign = _extends({}, input, {
              updatedAt: new Date()
            });
            _context4.next = 7;
            return models.Campaign.findByIdAndUpdate(input.id, campaign, { new: true });

          case 7:
            updatedCampaign = _context4.sent;
            return _context4.abrupt('return', updatedCampaign);

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4['catch'](3);
            throw new Error(_context4.t0.message || _context4.t0);

          case 14:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined, [[3, 11]]);
  }));

  return function updateCampaign(_x10, _x11, _x12) {
    return _ref9.apply(this, arguments);
  };
}();

var deleteCampaign = exports.deleteCampaign = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(parent, args, context) {
    var models, id, campaign, updatedCampaign;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            models = context.models;
            id = args.input.id;
            _context5.prev = 2;
            _context5.next = 5;
            return models.Campaign.findOne({ _id: id });

          case 5:
            campaign = _context5.sent;

            if (!(campaign.huntedCoupons == 0)) {
              _context5.next = 13;
              break;
            }

            _context5.next = 9;
            return models.Campaign.findByIdAndUpdate(id, {
              deleted: true,
              updatedAt: new Date()
            }, { new: true });

          case 9:
            updatedCampaign = _context5.sent;
            return _context5.abrupt('return', updatedCampaign);

          case 13:
            throw new Error('This campaign can not be deleted because there are coupons hunted.');

          case 14:
            _context5.next = 19;
            break;

          case 16:
            _context5.prev = 16;
            _context5.t0 = _context5['catch'](2);
            throw new Error(_context5.t0.message || _context5.t0);

          case 19:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined, [[2, 16]]);
  }));

  return function deleteCampaign(_x13, _x14, _x15) {
    return _ref10.apply(this, arguments);
  };
}();

var getCampaign = exports.getCampaign = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(parent, args, context) {
    var id, models, campaign;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = args.id;
            models = context.models;
            _context6.prev = 2;
            _context6.next = 5;
            return models.Campaign.findOne({ _id: id });

          case 5:
            campaign = _context6.sent;
            return _context6.abrupt('return', campaign);

          case 9:
            _context6.prev = 9;
            _context6.t0 = _context6['catch'](2);
            throw new Error(_context6.t0.message || _context6.t0);

          case 12:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined, [[2, 9]]);
  }));

  return function getCampaign(_x16, _x17, _x18) {
    return _ref11.apply(this, arguments);
  };
}();

var getCouponsFromCampaign = exports.getCouponsFromCampaign = function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(parent, args, context) {
    var campaignId, models, _ref13, coupons;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            campaignId = args.campaignId;
            models = context.models;
            _context7.prev = 2;
            _context7.next = 5;
            return models.Campaign.findOne({ _id: campaignId }).populate('coupons').exec();

          case 5:
            _ref13 = _context7.sent;
            coupons = _ref13.coupons;
            return _context7.abrupt('return', coupons);

          case 10:
            _context7.prev = 10;
            _context7.t0 = _context7['catch'](2);
            throw new Error(_context7.t0.message || _context7.t0);

          case 13:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined, [[2, 10]]);
  }));

  return function getCouponsFromCampaign(_x19, _x20, _x21) {
    return _ref12.apply(this, arguments);
  };
}();

var getHuntersByCampaign = exports.getHuntersByCampaign = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(parent, args, context) {
    var campaignId, models, request, authentication, makerId, campaign, coupons, hunters;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            campaignId = args.campaignId;
            models = context.models, request = context.request;
            authentication = request.headers.authentication;
            _context8.next = 5;
            return (0, _model.extractUserIdFromToken)(authentication);

          case 5:
            makerId = _context8.sent;
            _context8.prev = 6;
            _context8.next = 9;
            return models.Campaign.findOne({
              _id: campaignId,
              maker: makerId
            }).populate({
              path: 'coupons',
              match: {
                hunter: { '$exists': true }
              }
            });

          case 9:
            campaign = _context8.sent;
            _context8.next = 12;
            return models.Coupon.find({
              _id: { '$in': campaign.coupons }
            }).populate('hunter');

          case 12:
            coupons = _context8.sent;
            hunters = coupons.map(function (item) {
              return item.hunter;
            });
            return _context8.abrupt('return', hunters);

          case 17:
            _context8.prev = 17;
            _context8.t0 = _context8['catch'](6);
            throw new Error(_context8.t0.message || _context8.t0);

          case 20:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined, [[6, 17]]);
  }));

  return function getHuntersByCampaign(_x22, _x23, _x24) {
    return _ref14.apply(this, arguments);
  };
}();

var campaignsByMakerId = exports.campaignsByMakerId = function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(parent, _ref16, _ref17) {
    var makerId = _ref16.makerId;
    var models = _ref17.models;
    var campaigns;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return models.Campaign.find({ maker: makerId }, '-coupons');

          case 3:
            campaigns = _context9.sent;
            return _context9.abrupt('return', campaigns);

          case 7:
            _context9.prev = 7;
            _context9.t0 = _context9['catch'](0);
            throw new Error('Maker id not exist');

          case 10:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined, [[0, 7]]);
  }));

  return function campaignsByMakerId(_x25, _x26, _x27) {
    return _ref15.apply(this, arguments);
  };
}();

function validateRange(input) {
  if (input.endAt <= input.startAt) {
    throw new Error('endAt should be greater than startAt.');
  }
  return;
}

function addCampaignToOffice(officeId, campaignId, models) {
  return models.Office.findByIdAndUpdate(officeId, {
    '$push': { 'campaigns': campaignId },
    updatedAt: new Date()
  }, { new: true });
}

function addCampaignsToMaker(makerId, campaignId, models) {
  return models.Maker.findByIdAndUpdate(makerId, {
    '$push': { 'campaigns': campaignId },
    updatedAt: new Date()
  }, { new: true });
}

function findHuntedCampaign(campaignId, mycampaigns) {
  return mycampaigns.find(function (mycampaign) {
    return mycampaign.id === campaignId;
  });
}

function getCampaignsWithHuntedCoupons(mycampaigns, hunterCoupons) {
  var data = {};
  for (var i = 0; i < mycampaigns.length; i++) {
    var campaign = mycampaigns[i];
    var mycoupons = _lodash2.default.intersectionBy(campaign.coupons, hunterCoupons, 'id');
    data[campaign.id] = mycoupons.length;
  }
  return data;
}

function addCouponsHuntedByMe(campaigns, mycampaigns, numberOfHuntedCoupons) {
  var result = [];
  for (var i = 0; i < campaigns.length; i++) {
    var campaign = campaigns[i];
    var isMyCampaign = findHuntedCampaign(campaign.id, mycampaigns);
    if (isMyCampaign) {
      campaign.couponsHuntedByMe = numberOfHuntedCoupons[campaign.id];
    } else {
      campaign.couponsHuntedByMe = 0;
    }
    result.push(campaign);
  }
  return result;
}

function updateRelatedModels(params) {
  var officeId = params.officeId,
      campaignId = params.campaignId,
      models = params.models,
      makerId = params.makerId;

  var promiseCampaignToOffice = addCampaignToOffice(officeId, campaignId, models);
  var promiseCampaignsToMaker = addCampaignsToMaker(makerId, campaignId, models);
  return Promise.all([promiseCampaignToOffice, promiseCampaignsToMaker]);
}
//# sourceMappingURL=campaign.resolver.js.map