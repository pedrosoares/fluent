"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mysql = _interopRequireDefault(require("mysql"));

var _Configuration = require("../Configuration");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var transactions = {};

var MysqlDriver =
/*#__PURE__*/
function () {
  function MysqlDriver() {
    _classCallCheck(this, MysqlDriver);

    var options = Object.assign({
      connectionLimit: 10
    }, _Configuration.Configuration.connections[_Configuration.Configuration["default"]]);
    delete options.driver;
    this.pool = _mysql["default"].createPool(options);
    ;
  }

  _createClass(MysqlDriver, [{
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
          connection.beginTransaction(function (err) {
            if (err) {
              connection.rollback(function () {
                connection.release();
              });
              reject('Could`t get a connection!');
            } else {
              transactions[id] = connection;
              resolve(id);
              /*connection.query('INSERT INTO X SET ?', [X], function(err, results) {
                  if (err) {          //Query Error (Rollback and release connection)
                      connection.rollback(function() {
                          connection.release();
                          //Failure
                      });
                  } else {
                      connection.commit(function(err) {
                          if (err) {
                              connection.rollback(function() {
                                  connection.release();
                                  //Failure
                              });
                          } else {
                              connection.release();
                              //Success
                          }
                      });
                  }
              });*/
            }
          });
        });
      });
    }
  }]);

  return MysqlDriver;
}();

var _default = MysqlDriver;
exports["default"] = _default;