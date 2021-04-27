"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _QueryBuilder = _interopRequireDefault(require("./QueryBuilder"));

var _HasMany = _interopRequireDefault(require("./HasMany"));

var _Configuration = require("./Configuration");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Model = /*#__PURE__*/function () {
  function Model() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Model);

    this.connection = (0, _Configuration.GetDriver)(_Configuration.Configuration["default"]);
    this.table = "".concat(this.constructor.name).toLowerCase();
    this.primaryKey = 'id';
    this.filters = [];
    this["protected"] = []; // Protect fields (not used on serialize method)

    this.data = data;
  }

  _createClass(Model, [{
    key: "fill",
    value: function fill(data) {
      var _this = this;

      this.data = this.data || {};
      Object.keys(data).forEach(function (field) {
        if (_this.hasOwnProperty(field)) _this[field] = data[field];
        _this.data[field] = data[field];
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
      var fields_to_ignore = this["protected"].concat(ignore || []);
      return Object.keys(this.data) // Remove all fields present in PROTECTED and IGNORE PARAMETER
      .filter(function (field) {
        return !fields_to_ignore.find(function (p) {
          return p === field;
        });
      }).map(function (field) {
        return _defineProperty({}, field, _this2.data[field]);
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
      return "".concat(this.constructor.name, "_id").toLowerCase();
    }
  }, {
    key: "query",
    value: function query() {
      return new _QueryBuilder["default"](this);
    }
  }, {
    key: "save",
    value: function save() {
      throw new Error("Save 'Model' no implemented yet");
    }
  }, {
    key: "delete",
    value: function _delete() {
      throw new Error("Delete 'Model' no implemented yet");
    }
  }, {
    key: "hasMany",
    value: function hasMany(related) {
      var foreignKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var localKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var $instance = new related.prototype.constructor();
      var $foreignKey = foreignKey || this.getForeignKey();
      var $localKey = localKey || this.getKeyName();
      return new _HasMany["default"]($instance.query(), this, $foreignKey, $localKey);
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

var _default = Model;
exports["default"] = _default;