"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Configurator = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var connection_pool = {};
var drivers = {};

var env = function env(_env, default_value) {
  return process.env[_env] || default_value;
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

var Configurator = /*#__PURE__*/function () {
  function Configurator() {
    _classCallCheck(this, Configurator);
  }

  _createClass(Configurator, [{
    key: "default_connection",
    get: function get() {
      return Configuration["default"];
    }
  }, {
    key: "get_connection_configuration",
    value: function get_connection_configuration(connection) {
      if (Configuration.connections[connection]) return Configuration.connections[connection];
      throw new Error("No connection configuration found for \"".concat(connection, "\""));
    }
  }, {
    key: "get_driver",
    value: function get_driver(connection_name) {
      // find connection configuration
      var connection = Configuration.connections[connection_name]; // configuration has connection on pool

      if (connection && connection_pool[connection_name]) return connection_pool[connection_name]; // configuration has valid driver

      if (connection && drivers[connection.driver]) // Create connection, put it in the pool and deliver
        return connection_pool[connection_name] = drivers[connection.driver](); // Throw NoDriver exception

      throw new Error("Connection configuration \"".concat(connection_name, "\" not found"));
    }
  }, {
    key: "register_driver",
    value: function register_driver(name, driver) {
      if (Object.hasOwnProperty.call(driver, name)) throw new Error("Driver already exists");

      drivers[name] = function () {
        return driver;
      };
    }
  }, {
    key: "configure",
    value: function configure() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      Configuration = Object.assign(Configuration, config);
    }
  }, {
    key: "use",
    value: function use(config) {
      config(this);
    }
  }]);

  return Configurator;
}();

exports.Configurator = Configurator;