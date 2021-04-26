"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var parseParams = function parseParams(args, type, builder) {
  var value = null;
  var compare = '=';

  switch (args.length) {
    case 3:
      compare = args[1];
      value = args[2];
      break;

    case 2:
      value = args[1];
      break;

    case 1:
      if (args[0] instanceof Function) {
        var b = new QueryBuilder(builder.model);
        args[0](b);
        return {
          type: type,
          filter: b.filters
        };
      } else throw new Error("Parameter should be a function a column and value or a column, comparation and value");

    default:
      throw new Error("Invalid number of parameters");
  }

  return {
    column: args[0],
    value: value,
    compare: compare,
    type: type
  };
};

var parseWith = function parseWith(args) {
  if (args.length === 0) throw new Error("With needs 1 or more parameters");
  var relations = [];
  args.forEach(function (arg) {
    if (arg instanceof Array) {
      relations = relations.concat(parseWith(arg));
    } else relations.push(arg);
  });
  return relations;
};

var QueryBuilder = /*#__PURE__*/function () {
  function QueryBuilder(model) {
    _classCallCheck(this, QueryBuilder);

    this.model = model;
    this.columns = ['*']; //USED BY SelectBuilder

    this.filters = []; //USED BY WhereBuilder

    this.groups = []; //USED BY GroupBuilder

    this.eagerLoader = [];
    this.eagerData = {};
    this.limit = {
      skip: null,
      take: null
    };
    this.order = {
      column: null,
      direction: null
    };
    this.transactionId = null; // TODO Use Proxy to block variable access
  }

  _createClass(QueryBuilder, [{
    key: "transaction",
    value: function transaction() {
      var _this = this;

      return this.model.connection.transaction().then(function (id) {
        _this.transactionId = id;
        return _this;
      });
    }
  }, {
    key: "commit",
    value: function commit() {
      this.model.connection.commit(this.transactionId);
      this.transactionId = null;
    }
  }, {
    key: "rollback",
    value: function rollback() {
      this.model.connection.rollback(this.transactionId);
      this.transactionId = null;
    } //#SELECT BEGIN

  }, {
    key: "with",
    value: function _with(relation) {
      var _this2 = this;

      parseWith(Array.from(arguments)).forEach(function (relation) {
        if (!_this2.model[relation]) throw new Error("Eager Loader \"".concat(relation, "\" not found"));

        _this2.eagerLoader.push({
          relation: _this2.model[relation](),
          name: relation
        });
      });
      return this;
    }
  }, {
    key: "where",
    value: function where() {
      var data = parseParams(arguments, null, this);
      if (this.filters.length === 0) this.filters.push(data);else this.andWhere.apply(this, arguments);
      return this;
    }
  }, {
    key: "orWhere",
    value: function orWhere() {
      var data = parseParams(arguments, 'or', this);
      this.filters.push(data);
      return this;
    }
  }, {
    key: "andWhere",
    value: function andWhere() {
      var data = parseParams(arguments, 'and', this);
      this.filters.push(data);
      return this;
    }
  }, {
    key: "groupBy",
    value: function groupBy() {
      if (this.groups.length > 0) throw new Error("Group By is not empty");
      this.groups = Object.values(arguments);
      return this;
    }
  }, {
    key: "skip",
    value: function skip(_skip) {
      this.limit.skip = _skip;
      return this;
    }
  }, {
    key: "take",
    value: function take(_take) {
      this.limit.take = _take;
      return this;
    }
  }, {
    key: "orderBy",
    value: function orderBy(column, direction) {
      this.order.column = column;
      this.order.direction = direction;
      return this;
    } // TODO Use proxy and Use model Instance

  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var options,
            select,
            data,
            joinData,
            joinResponse,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                options = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
                select = this.model.connection.parseSelect(this.model.table, this.columns, this.filters, this.limit, this.order, this.groups); // Query using driver

                _context2.next = 4;
                return this.model.connection.query(options, select.sql, select.data);

              case 4:
                data = _context2.sent;
                // Eager Loader
                joinData = this.eagerLoader.map( /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(join) {
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return join.relation.get(join.name, data);

                          case 2:
                            return _context.abrupt("return", _context.sent);

                          case 3:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x) {
                    return _ref.apply(this, arguments);
                  };
                }()); // Wait for the Join

                _context2.next = 8;
                return Promise.all(joinData);

              case 8:
                joinResponse = _context2.sent;

                if (!(joinResponse.length > 0)) {
                  _context2.next = 13;
                  break;
                }

                return _context2.abrupt("return", data.map(function (d) {
                  joinResponse.forEach(function (join) {
                    d[join.group] = join.data.filter(function (val) {
                      return val[join.foreignKey] === d[join.localId];
                    });
                  });
                  return d;
                }));

              case 13:
                return _context2.abrupt("return", data);

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function get() {
        return _get.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "first",
    value: function first() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.take(1).get(options).then(function (data) {
        if (data.length === 1) return data[0];
        return null;
      });
    }
  }, {
    key: "firstOrFail",
    value: function firstOrFail() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.first(options).then(function (result) {
        if (!result) throw new Error("Model Not Found");
        return result;
      });
    } //#SELECT END
    //#INSERT BEGIN

  }, {
    key: "insert",
    value: function () {
      var _insert = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(data) {
        var options,
            localData,
            columns,
            i,
            values,
            insert_sql,
            response,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};

                if (data instanceof Object || data instanceof Array) {
                  _context3.next = 3;
                  break;
                }

                throw new Error("Data parameter should be an object or an array of object!");

              case 3:
                // Transform data Into a Array if is not.
                localData = [data];

                if (data instanceof Array) {
                  localData = data;
                } // Map Insert Columns


                columns = [];

                for (i in localData[0]) {
                  if (localData[0].hasOwnProperty(i)) {
                    columns.push(i);
                  }
                } // Get Insert Values in the correct order


                values = localData.map(function (data) {
                  return Object.values(columns.map(function (column) {
                    return data[column];
                  }));
                }); // Generate insert SQL

                insert_sql = this.model.connection.parseInsert(this.model.table, columns, values); // Perform insert

                _context3.next = 11;
                return this.model.connection.query(options, insert_sql, [values]);

              case 11:
                response = _context3.sent;
                return _context3.abrupt("return", response.affectedRows > 0);

              case 13:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function insert(_x2) {
        return _insert.apply(this, arguments);
      }

      return insert;
    }()
  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(data) {
        var options,
            columns,
            i,
            values,
            insert_sql,
            response,
            _args4 = arguments;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                options = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {};

                if (data instanceof Object) {
                  _context4.next = 3;
                  break;
                }

                throw new Error("Data parameter should be an object!");

              case 3:
                // Map Insert Columns
                columns = [];

                for (i in data) {
                  if (data.hasOwnProperty(i)) {
                    columns.push(i);
                  }
                } // Get Insert Values in the correct order


                values = Object.values(columns.map(function (column) {
                  return data[column];
                })); // Generate insert SQL

                insert_sql = this.model.connection.parseInsert(this.model.table, columns, [values]); // Perform insert

                _context4.next = 9;
                return this.model.connection.query(options, insert_sql, [values]);

              case 9:
                response = _context4.sent;
                return _context4.abrupt("return", _objectSpread(_defineProperty({}, this.model.primaryKey, response.insertId), data));

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function create(_x3) {
        return _create.apply(this, arguments);
      }

      return create;
    }() //#INSERT END
    //#DELETE BEGIN

  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var options,
            deleteObj,
            _args5 = arguments;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                options = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {};
                deleteObj = this.model.connection.parseDelete(this.model.table, this.filters);

                if (!(this.eagerLoader.length > 0)) {
                  _context5.next = 4;
                  break;
                }

                throw new Error("Do not use EagerLoader with Delete function");

              case 4:
                return _context5.abrupt("return", this.model.connection.query(options, deleteObj.sql, deleteObj.data));

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _delete() {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }() //#DELETE END
    //#UPDATE BEGIN

  }, {
    key: "update",
    value: function update(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var update = this.model.connection.parseUpdate(this.model.table, data, this.filters, this.limit, this.order);
      if (this.eagerLoader.length > 0) throw new Error("Do not use EagerLoader with Update function");
      return this.model.connection.query(options, update.sql, update.data);
    } //#UPDATE END
    //#RAW BEGIN

  }, {
    key: "raw",
    value: function raw(sql) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.model.connection.query(options, sql, params);
    } //#RAW END

  }]);

  return QueryBuilder;
}();

var _default = QueryBuilder;
exports["default"] = _default;