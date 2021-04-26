"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _FilterBuilder = _interopRequireDefault(require("./FilterBuilder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UpdateBuilder = /*#__PURE__*/function () {
  function UpdateBuilder(table, columns, filters, limit, order) {
    _classCallCheck(this, UpdateBuilder);

    this.table = table;
    this.columns = columns;
    this.filters = filters;
    this.limit = limit || {};
    this.order = order || {};
  }

  _createClass(UpdateBuilder, [{
    key: "tablerize",
    value: function tablerize(column) {
      return "`".concat(column, "`");
    }
  }, {
    key: "parse",
    value: function parse() {
      var whereBuilder = new _FilterBuilder["default"](this.filters);
      var columns = Object.keys(this.columns);
      var values = Object.values(this.columns);
      var data = columns.map(function (col, index) {
        return "".concat(col, " = ?").concat(index >= columns.length - 1 ? '' : ', ');
      }).join('');
      var whereBuilded = whereBuilder.parse();
      return {
        sql: "UPDATE ".concat(this.tablerize(this.table), " SET ").concat(data, " ").concat(whereBuilded.sql, " ").concat(this.parseOrder(), " ").concat(this.parseLimit()).trim(),
        data: values.concat(whereBuilded.data)
      };
    }
  }, {
    key: "parseLimit",
    value: function parseLimit() {
      var skip = "";
      var take = "";

      if (!!this.limit.skip) {
        skip = "OFFSET ".concat(this.limit.skip);
      }

      if (!!this.limit.take) {
        take = "LIMIT ".concat(this.limit.take);
      }

      return "".concat(take, " ").concat(skip).trim();
    }
  }, {
    key: "parseOrder",
    value: function parseOrder() {
      if (!!this.order.column && !!this.order.direction) {
        return "ORDER BY ".concat(this.tablerize(this.order.column), " ").concat(this.order.direction);
      }

      return "";
    }
  }]);

  return UpdateBuilder;
}();

var _default = UpdateBuilder;
exports["default"] = _default;