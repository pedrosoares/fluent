"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mysql = _interopRequireDefault(require("mysql"));

var _Configuration = require("../Configuration");

var _SelectBuilder = _interopRequireDefault(require("./Mysql/SelectBuilder"));

var _InsertBuilder = _interopRequireDefault(require("./Mysql/InsertBuilder"));

var _DeleteBuilder = _interopRequireDefault(require("./Mysql/DeleteBuilder"));

var _UpdateBuilder = _interopRequireDefault(require("./Mysql/UpdateBuilder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var transactions = {};

var MysqlDriver = /*#__PURE__*/function () {
  function MysqlDriver() {
    _classCallCheck(this, MysqlDriver);

    var options = Object.assign({
      connectionLimit: 10
    }, _Configuration.Configuration.connections['mysql']);
    delete options.driver;
    this.pool = _mysql["default"].createPool(options);
  }

  _createClass(MysqlDriver, [{
    key: "query",
    value: function query(options, sql, params) {
      var connection = this.getConnection(options);
      return new Promise(function (resolve, reject) {
        return connection.query(sql, params, function (error, data, _) {
          if (error) return reject(error);
          resolve(data);
        });
      });
    }
  }, {
    key: "getConnection",
    value: function getConnection() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (options.hasOwnProperty("transaction")) return transactions[options.transaction];else return this.pool;
    }
  }, {
    key: "commit",
    value: function commit(transaction) {
      var connection = transactions[transaction];
      connection.commit(function (err) {
        if (err) {
          return connection.rollback(function () {
            connection.release();
            throw err;
          });
        }

        connection.release();
      });
      delete transactions[transaction];
    }
  }, {
    key: "rollback",
    value: function rollback(transaction) {
      var connection = transactions[transaction];
      connection.rollback(function () {
        connection.release();
      });
      delete transactions[transaction];
    }
  }, {
    key: "transaction",
    value: function transaction() {
      var _this = this;

      var id = (0, _Configuration.uuidv4)();
      return new Promise(function (resolve, reject) {
        _this.pool.getConnection(function (err, connection) {
          if (err) reject(err);else connection.beginTransaction(function (err) {
            if (err) {
              connection.rollback(function () {
                connection.release();
              });
              reject('Could`t get a connection!');
            } else {
              transactions[id] = connection;
              resolve(id);
            }
          });
        });
      });
    }
  }, {
    key: "parseSelect",
    value: function parseSelect(table, columns, filters, limit, order, groups) {
      return new _SelectBuilder["default"](table, columns, filters, limit, order, groups).parse();
    }
  }, {
    key: "parseInsert",
    value: function parseInsert(table, columns, values) {
      return new _InsertBuilder["default"](table, columns, values).parse();
    }
  }, {
    key: "parseDelete",
    value: function parseDelete(table, filters) {
      return new _DeleteBuilder["default"](table, filters).parse();
    }
  }, {
    key: "parseUpdate",
    value: function parseUpdate(table, columns, filters, limit, order) {
      return new _UpdateBuilder["default"](table, columns, filters, limit, order).parse();
    }
  }]);

  return MysqlDriver;
}();

var _default = MysqlDriver;
exports["default"] = _default;