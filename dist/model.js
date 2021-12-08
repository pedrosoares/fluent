"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Model = void 0;

var _has_many = require("./has_many");

var _has_one = require("./has_one");

var _query = require("./query.builder");

var _index = require("./index");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var internal_properties = ["_connection", "table", "primaryKey", "foreignKey", "filters", "protected", "relations"];

var Model = /*#__PURE__*/function () {
  function Model() {
    _classCallCheck(this, Model);

    // Connection Name
    this._connection = _index.configurator.default_connection;
    this.table = "".concat(this.constructor.name).toLowerCase();
    this.primaryKey = 'id';
    this.foreignKey = "".concat(this.table, "_id").toLowerCase();
    this.softDelete = null; // Field Used on soft-delete

    this.filters = [];
    this["protected"] = []; // Protect fields (not used on serialize method)

    this.relations = {}; // Used on joins
  }

  _createClass(Model, [{
    key: "get_connection",
    value: function get_connection() {
      // Get Driver based on connection name
      return _index.configurator.get_driver(this._connection);
    }
  }, {
    key: "fill",
    value: function fill(data) {
      var _this = this;

      Object.keys(data).forEach(function (field) {
        if (_this.hasOwnProperty(field)) _this[field] = data[field];else if (_this[field]) _this.relations[field] = data[field];
      });
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.serialize();
    }
  }, {
    key: "serialize",
    value: function serialize() {
      var _this2 = this;

      var ignore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var fields_to_ignore = this["protected"].concat(internal_properties).concat(ignore || []);
      return [].concat(Object.keys(this)) // model_keys
      .concat(Object.keys(this.relations)) // relation_keys
      // Remove all fields present in PROTECTED and IGNORE PARAMETER
      .filter(function (field) {
        return !fields_to_ignore.find(function (p) {
          return p === field;
        });
      }).map(function (field) {
        // Get model value by default
        var value = _this2[field]; // If the value is not a property

        if (!_this2.hasOwnProperty(field)) {
          // Get relation value
          value = _this2.relations[field]; // If relation value exists serialize-it

          if (value) // If relation is an Array map-serialize
            if (Array.isArray(value)) value = value.map(function (val) {
              return val.serialize();
            }); // If is an Model, serialize-it
            else value = value.serialize();
        } // Return new Raw Object


        return _defineProperty({}, field, value);
      }).reduce(function (c, v) {
        return _objectSpread(_objectSpread({}, c), v);
      }, {});
    }
  }, {
    key: "getKeyName",
    value: function getKeyName() {
      return this.primaryKey;
    }
  }, {
    key: "getForeignKey",
    value: function getForeignKey() {
      return this.foreignKey;
    }
  }, {
    key: "query",
    value: function query() {
      return new _query.QueryBuilder(this);
    }
  }, {
    key: "save",
    value: function () {
      var _save = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var key_name, key_value, ignore_keys;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                key_name = this.getKeyName();
                key_value = this[key_name]; // Validate if the Identification of the model is valid

                if (!(key_value === null || key_value === undefined)) {
                  _context.next = 4;
                  break;
                }

                throw new Error("Value for key name '".concat(key_name, "' not found"));

              case 4:
                // Keys to ignore
                ignore_keys = [key_name] // Ignore all relations
                .concat(Object.keys(this.relations)); // Update Model

                return _context.abrupt("return", this.query().where(key_name, key_value) // Ignore the  model Identification
                .update(this.serialize(ignore_keys)));

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function save() {
        return _save.apply(this, arguments);
      }

      return save;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var key_name, key_value;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                key_name = this.getKeyName();
                key_value = this[key_name]; // Validate if the Identification of the model is valid

                if (!(key_value === null || key_value === undefined)) {
                  _context2.next = 4;
                  break;
                }

                throw new Error("Value for key name '".concat(key_name, "' not found"));

              case 4:
                return _context2.abrupt("return", this.query().where(key_name, key_value)["delete"]());

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _delete() {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: "hasMany",
    value: function hasMany(related) {
      var foreignKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var localKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var $instance = new related.prototype.constructor();
      var $foreignKey = foreignKey || this.getForeignKey();
      var $localKey = localKey || this.getKeyName();
      return new _has_many.HasMany($instance.query(), related.prototype, $foreignKey, $localKey);
    }
  }, {
    key: "hasOne",
    value: function hasOne(related) {
      var foreignKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var localKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var $instance = new related.prototype.constructor();
      var $foreignKey = foreignKey || this.getForeignKey();
      var $localKey = localKey || this.getKeyName();
      return new _has_one.HasOne($instance.query(), related.prototype, $foreignKey, $localKey);
    }
  }], [{
    key: "parse",
    value: function parse(data) {
      var model = new this.prototype.constructor();
      model.fill(data);
      return model;
    }
  }, {
    key: "query",
    value: function query() {
      if (this instanceof Function) {
        return new this.prototype.constructor().query();
      }

      return this.query();
    }
  }, {
    key: "all",
    value: function all() {
      var instance = new this.prototype.constructor();
      return instance.query().get();
    }
  }, {
    key: "insert",
    value: function insert(bulkData) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.query().insert(bulkData, options);
    }
  }, {
    key: "create",
    value: function create(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.query().create(data, options);
    }
  }, {
    key: "transaction",
    value: function transaction() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (transaction, commit, rollback) {};
      return this.query().transaction().then(function (query) {
        var transaction = query.transactionId,
            commit = function commit() {
          return query.commit();
        },
            rollback = function rollback() {
          return query.rollback();
        };

        if (callback) callback(transaction, commit, rollback);
        return {
          transaction: transaction,
          commit: commit,
          rollback: rollback
        };
      });
    }
  }]);

  return Model;
}();

exports.Model = Model;