"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _SelectBuilder = _interopRequireDefault(require("./Drivers/Mysql/SelectBuilder"));

var _InsertBuilder = _interopRequireDefault(require("./Drivers/Mysql/InsertBuilder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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

var QueryBuilder =
/*#__PURE__*/
function () {
  function QueryBuilder(model) {
    _classCallCheck(this, QueryBuilder);

    this.model = model;
    this.columns = ['*']; //USED BY SelectBuilder

    this.filters = []; //USED BY WhereBuilder

    this.eagerLoader = [];
    this.eagerData = {};
    this.limit = {
      skip: null,
      take: null
    };
    this.order = {
      column: null,
      direction: null
    }; // TODO Use Proxy to block variable access
  } //#SELECT BEGIN


  _createClass(QueryBuilder, [{
    key: "with",
    value: function _with(relation) {
      var _this = this;

      parseWith(Array.from(arguments)).forEach(function (relation) {
        if (!_this.model[relation]) throw new Error("Eager Loader \"".concat(relation, "\" not found"));

        _this.eagerLoader.push({
          relation: _this.model[relation](),
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
    }
  }, {
    key: "get",
    value: function get() {
      var _this2 = this;

      var selectBuilder = new _SelectBuilder["default"](this.model.table, this.columns, this.filters, this.limit, this.order);
      return this.model.connection.query(function (connection, resolve, reject) {
        var sqlBuilded = selectBuilder.parse();
        connection.query(sqlBuilded.sql, sqlBuilded.data, function (error, data, fields) {
          if (error) return reject(error); //Eager Loader

          var joinData = _this2.eagerLoader.map(
          /*#__PURE__*/
          function () {
            var _ref = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee(join) {
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
          }()); //Wait for the Join


          Promise.all(joinData).then(function (joinResponse) {
            // If has Join Return it (Join already come with the data formatted) or the Original Data
            if (joinResponse.length > 0) {
              // Insert Join Data to the original Select
              // TODO Make this Code less Ugly possible
              resolve(data.map(function (d) {
                joinResponse.forEach(function (join) {
                  d[join.group] = join.data.filter(function (val) {
                    return val[join.foreignKey] === d[join.localId];
                  });
                });
                return d;
              }));
            } else resolve(data);
          })["catch"](function (error) {
            return reject(error);
          });
          /*
          TODO Use proxy and Use model Instance
          resolve(data/!*.map(data => {
              const model = new this.model.constructor;
              for (let i in data){
                  if(data.hasOwnProperty(i)) {
                      model.data[i] = data[i];
                  }
              }
              return model;
          })*!/)*/
        });
      });
    }
  }, {
    key: "first",
    value: function first() {
      return this.take(1).get().then(function (data) {
        if (data.length === 1) return data[0];
        return null;
      });
    }
  }, {
    key: "firstOrFail",
    value: function firstOrFail() {
      return this.first().then(function (result) {
        if (!result) throw new Error("Model Not Found");
        return result;
      });
    } //#SELECT END
    //#INSERT BEGIN

  }, {
    key: "insert",
    value: function insert(data) {
      if (!(data instanceof Object || data instanceof Array)) {
        throw new Error("Data parameter should be an object or an array of object!");
      } //Transform data Into a Array if is not.


      var localData = [data];

      if (data instanceof Array) {
        localData = data;
      } //Map Insert Columns


      var columns = [];

      for (var i in localData[0]) {
        if (localData[0].hasOwnProperty(i)) {
          columns.push(i);
        }
      } //Get Insert Values in the correct order


      var values = localData.map(function (data) {
        return Object.values(columns.map(function (column) {
          return data[column];
        }));
      });
      var insertBuilder = new _InsertBuilder["default"](this.model.table, columns, values);
      /*return insertBuilder.parse();*/

      return this.model.connection.query(function (connection, resolve, reject) {
        connection.query(insertBuilder.parse(), [values], function (error, data, fields) {
          if (error) return reject(error);
          resolve(data.affectedRows > 0);
        });
      });
    }
  }, {
    key: "create",
    value: function create(data) {
      var _this3 = this;

      if (!(data instanceof Object)) {
        throw new Error("Data parameter should be an object!");
      } //Map Insert Columns


      var columns = [];

      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          columns.push(i);
        }
      } //Get Insert Values in the correct order


      var values = Object.values(columns.map(function (column) {
        return data[column];
      }));
      var insertBuilder = new _InsertBuilder["default"](this.model.table, columns, [values]);
      return this.model.connection.query(function (connection, resolve, reject) {
        connection.query(insertBuilder.parse(), [[values]], function (error, response, fields) {
          if (error) return reject(error);
          resolve(_objectSpread(_defineProperty({}, _this3.model.primaryKey, response.insertId), data));
        });
      });
    } //#INSERT END

  }]);

  return QueryBuilder;
}();

var _default = QueryBuilder;
exports["default"] = _default;