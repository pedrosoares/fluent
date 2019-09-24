"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _MysqlDriver = _interopRequireDefault(require("./Drivers/MysqlDriver"));

var _QueryBuilder = _interopRequireDefault(require("./QueryBuilder"));

var _HasMany = _interopRequireDefault(require("./HasMany"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Model =
/*#__PURE__*/
function () {
  function Model() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Model);

    this.connection = new _MysqlDriver["default"]();
    this.table = "".concat(this.constructor.name).toLowerCase();
    this.primaryKey = 'id';
    this.filters = [];
    this.relations = []; //TODO Only Access using Proxy

    this.data = data;
  }

  _createClass(Model, [{
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
    value: function save() {}
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
      return this.query().insert(bulkData);
    }
  }, {
    key: "create",
    value: function create(data) {
      return this.query().create(data);
    }
  }]);

  return Model;
}();

var _default = Model;
exports["default"] = _default;