"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Model = void 0;

var _has_many = require("./has_many");

var _has_one = require("./has_one");

var _query = require("./query.builder");

var _index = require("./index");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var internal_properties = ["connection", "table", "primaryKey", "foreignKey", "filters", "protected", "relations"];

var Model = /*#__PURE__*/function () {
  function Model() {
    _classCallCheck(this, Model);

    // Connection Name
    this.connection = _index.configurator.default_connection;
    this.table = "".concat(this.constructor.name).toLowerCase();
    this.primaryKey = 'id';
    this.foreignKey = "".concat(this.table, "_id").toLowerCase();
    this.filters = [];
    this["protected"] = []; // Protect fields (not used on serialize method)

    this.relations = {}; // Used on joins
  }

  _createClass(Model, [{
    key: "get_connection",
    value: function get_connection() {
      // Get Driver based on connection name
      return _index.configurator.get_driver(this.connection);
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