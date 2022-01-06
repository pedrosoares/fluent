"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HasMany = void 0;

var _helpers = require("./helpers");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HasMany = /*#__PURE__*/function () {
  function HasMany(queryBuilder, model, foreignKey, localId) {
    _classCallCheck(this, HasMany);

    this.queryBuilder = queryBuilder;
    this.model = model;
    this.foreignKey = foreignKey;
    this.localId = localId;
  }

  _createClass(HasMany, [{
    key: "parse",
    value: function parse() {
      var _this = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      //Find the Key of Search
      return data.map(function (d) {
        if (d.hasOwnProperty(_this.localId)) return d[_this.localId];
        return null;
      }) //Remove NULL Values
      .filter(function (d) {
        return !!d;
      });
    }
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(group) {
        var _this2 = this;

        var data,
            parentIds,
            firstId,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                data = _args.length > 1 && _args[1] !== undefined ? _args[1] : [];
                parentIds = this.parse(data);

                if (!(parentIds.length === 0)) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", {
                  type: "many",
                  group: group,
                  foreignKey: this.foreignKey,
                  localId: this.localId,
                  data: []
                });

              case 4:
                firstId = parentIds.pop();
                this.queryBuilder.where(this.foreignKey, firstId);
                parentIds.forEach(function (id) {
                  return _this2.queryBuilder.orWhere(_this2.foreignKey, id);
                });
                return _context.abrupt("return", this.queryBuilder.get().then(function (response) {
                  return {
                    type: "many",
                    group: group,
                    foreignKey: _this2.foreignKey,
                    localId: _this2.localId,
                    data: response.map(function (data) {
                      return (0, _helpers.dataToModel)(_this2.model, data);
                    })
                  };
                }));

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function get(_x) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
  }]);

  return HasMany;
}();

exports.HasMany = HasMany;