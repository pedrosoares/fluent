"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uuidv4 = exports.GetDriver = exports.Configuration = exports.Configure = void 0;

var _MysqlDriver = _interopRequireDefault(require("./Drivers/MysqlDriver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var env = function env(_env, default_value) {
  return process.env[_env] || default_value;
};

var drivers = {
  'mysql': function mysql() {
    return new _MysqlDriver["default"]();
  }
};
var Configuration = {
  'default': env('DB_CONNECTION', 'mysql'),
  'connections': {
    'sqlite': {
      'driver': 'sqlite',
      'url': env('DATABASE_URL'),
      'database': env('DB_DATABASE', 'database.sqlite'),
      'prefix': '',
      'foreign_key_constraints': env('DB_FOREIGN_KEYS', true)
    },
    'mysql': {
      'driver': 'mysql',
      'host': env('DB_HOST', '127.0.0.1'),
      'port': env('DB_PORT', '3306'),
      'database': env('DB_DATABASE', 'forge'),
      'user': env('DB_USERNAME', 'forge'),
      'password': env('DB_PASSWORD', ''),
      'charset': 'utf8mb4',
      'collation': 'utf8mb4_unicode_ci',
      'prefix': '',
      'prefix_indexes': true,
      'strict': true
    },
    'pgsql': {
      'driver': 'pgsql',
      'url': env('DATABASE_URL'),
      'host': env('DB_HOST', '127.0.0.1'),
      'port': env('DB_PORT', '5432'),
      'database': env('DB_DATABASE', 'forge'),
      'username': env('DB_USERNAME', 'forge'),
      'password': env('DB_PASSWORD', ''),
      'charset': 'utf8',
      'prefix': '',
      'prefix_indexes': true,
      'schema': 'public',
      'sslmode': 'prefer'
    },
    'sqlsrv': {
      'driver': 'sqlsrv',
      'url': env('DATABASE_URL'),
      'host': env('DB_HOST', 'localhost'),
      'port': env('DB_PORT', '1433'),
      'database': env('DB_DATABASE', 'forge'),
      'username': env('DB_USERNAME', 'forge'),
      'password': env('DB_PASSWORD', ''),
      'charset': 'utf8',
      'prefix': '',
      'prefix_indexes': true
    }
  }
};
exports.Configuration = Configuration;

var Configure = function Configure() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  exports.Configuration = Configuration = Object.assign(Configuration, config);
};

exports.Configure = Configure;

var GetDriver = function GetDriver(driver) {
  if (!drivers.hasOwnProperty(driver)) throw new Error("Driver '".concat(driver, "' not found!"));
  return drivers[driver]();
};

exports.GetDriver = GetDriver;

var uuidv4 = function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

exports.uuidv4 = uuidv4;