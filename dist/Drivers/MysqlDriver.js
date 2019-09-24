"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mysql = _interopRequireDefault(require("mysql"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MysqlDriver =
/*#__PURE__*/
function () {
  function MysqlDriver() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MysqlDriver);

    this.options = Object.assign({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_DATABASE || 'database'
    }, options);
  }

  _createClass(MysqlDriver, [{
    key: "query",
    value: function query(callback) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var connection = _mysql["default"].createConnection(_this.options);

        connection.connect();
        callback(connection, function (a) {
          resolve(a);
          connection.end();
        }, function (a) {
          reject(a);
          connection.end();
        });
      });
    }
  }]);

  return MysqlDriver;
}();

var _default = MysqlDriver;
exports["default"] = _default;