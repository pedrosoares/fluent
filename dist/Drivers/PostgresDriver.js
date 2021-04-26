"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pg = require("pg");

var _Configuration = require("../Configuration");

var _SelectBuilder = _interopRequireDefault(require("./Postgres/SelectBuilder"));

var _InsertBuilder = _interopRequireDefault(require("./Postgres/InsertBuilder"));

var _DeleteBuilder = _interopRequireDefault(require("./Postgres/DeleteBuilder"));

var _UpdateBuilder = _interopRequireDefault(require("./Postgres/UpdateBuilder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var transactions = {};

var PostgresDriver = /*#__PURE__*/function () {
  function PostgresDriver() {
    _classCallCheck(this, PostgresDriver);

    var options = Object.assign({}, _objectSpread({}, _Configuration.Configuration.connections['pgsql']));
    delete options.driver;
    this.pool = new _pg.Pool(options);
  }

  _createClass(PostgresDriver, [{
    key: "query",
    value: function () {
      var _query = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options, sql) {
        var params,
            connection,
            parseParam,
            response,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                params = _args.length > 2 && _args[2] !== undefined ? _args[2] : [];
                _context.next = 3;
                return this.getConnection(options);

              case 3:
                connection = _context.sent;

                parseParam = function parseParam(po) {
                  var r = [];
                  po.forEach(function (e) {
                    if (Array.isArray(e)) e.forEach(function (a) {
                      return r = r.concat(a);
                    });else r = r.concat(e);
                  });
                  return r;
                };

                _context.next = 7;
                return connection.query(sql, parseParam(params));

              case 7:
                response = _context.sent;

                if (!(response.command === "SELECT")) {
                  _context.next = 12;
                  break;
                }

                return _context.abrupt("return", response.rows);

              case 12:
                if (!(response.command === "INSERT")) {
                  _context.next = 14;
                  break;
                }

                return _context.abrupt("return", {
                  affectedRows: response.rowCount,
                  insertId: response.rows[0].id
                });

              case 14:
                return _context.abrupt("return", {
                  affectedRows: response.rowCount
                });

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function query(_x, _x2) {
        return _query.apply(this, arguments);
      }

      return query;
    }()
  }, {
    key: "getConnection",
    value: function getConnection() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (options.hasOwnProperty("transaction")) return transactions[options.transaction];else return this.pool;
    }
  }, {
    key: "commit",
    value: function () {
      var _commit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(transaction) {
        var connection;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (transactions.hasOwnProperty(transaction)) {
                  _context2.next = 2;
                  break;
                }

                throw new Error("Transaction not found");

              case 2:
                // Get transaction connection
                connection = transactions[transaction];
                _context2.prev = 3;
                _context2.next = 6;
                return connection.query('COMMIT');

              case 6:
                _context2.next = 13;
                break;

              case 8:
                _context2.prev = 8;
                _context2.t0 = _context2["catch"](3);
                _context2.next = 12;
                return connection.query('ROLLBACK');

              case 12:
                throw _context2.t0;

              case 13:
                _context2.prev = 13;
                // Delete connection from the cache
                delete transactions[transaction]; // Release connection

                connection.release();
                return _context2.finish(13);

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[3, 8, 13, 17]]);
      }));

      function commit(_x3) {
        return _commit.apply(this, arguments);
      }

      return commit;
    }()
  }, {
    key: "rollback",
    value: function () {
      var _rollback = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(transaction) {
        var connection;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (transactions.hasOwnProperty(transaction)) {
                  _context3.next = 2;
                  break;
                }

                throw new Error("Transaction not found");

              case 2:
                // Get transaction connection
                connection = transactions[transaction];
                _context3.prev = 3;
                _context3.next = 6;
                return connection.query('ROLLBACK');

              case 6:
                _context3.next = 11;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](3);
                throw _context3.t0;

              case 11:
                _context3.prev = 11;
                // Delete connection from the cache
                delete transactions[transaction]; // Release connection

                connection.release();
                return _context3.finish(11);

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[3, 8, 11, 15]]);
      }));

      function rollback(_x4) {
        return _rollback.apply(this, arguments);
      }

      return rollback;
    }()
  }, {
    key: "transaction",
    value: function () {
      var _transaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var id, client;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // Generate a random UUID for this transaction
                id = (0, _Configuration.uuidv4)(); // Get a new connection on the POOL

                _context4.next = 3;
                return this.pool.connect();

              case 3:
                client = _context4.sent;
                // Add Current connection tp transaction storage
                transactions[id] = client;
                _context4.prev = 5;
                _context4.next = 8;
                return client.query('BEGIN');

              case 8:
                return _context4.abrupt("return", id);

              case 11:
                _context4.prev = 11;
                _context4.t0 = _context4["catch"](5);
                _context4.next = 15;
                return client.query('ROLLBACK');

              case 15:
                // Remove current connection from the transaction storage
                delete transactions[id]; // Release current connection

                client.release(); // Pass the error forward

                throw _context4.t0;

              case 18:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[5, 11]]);
      }));

      function transaction() {
        return _transaction.apply(this, arguments);
      }

      return transaction;
    }()
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

  return PostgresDriver;
}();

var _default = PostgresDriver;
exports["default"] = _default;