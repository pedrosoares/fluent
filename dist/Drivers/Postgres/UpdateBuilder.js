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
      return "\"".concat(column, "\"");
    }
  }, {
    key: "parse",
    value: function parse() {
      var whereBuilder = new _FilterBuilder["default"](this.filters);
      var columns = Object.keys(this.columns);
      var values = Object.values(this.columns);
      var data = columns.map(function (col, index) {
        return "".concat(col, " = $").concat(index + 1);
      }).join(', ');
      var whereBuilt = whereBuilder.parse(columns.length);
      this.parseLimit(); // Validate if there is no Limit at Update

      return {
        sql: "UPDATE ".concat(this.tablerize(this.table), " SET ").concat(data, " ").concat(whereBuilt.sql, " ").concat(this.parseOrder()).trim(),
        data: values.concat(whereBuilt.data)
      };
    }
  }, {
    key: "parseLimit",
    value: function parseLimit() {
      if (!!this.limit.skip) {
        throw new Error("Postgres does not support Skip at Update Query");
      }

      if (!!this.limit.take) {
        throw new Error("Postgres does not support Take at Update Query");
      }
    }
  }, {
    key: "parseOrder",
    value: function parseOrder() {
      if (!!this.order.column && !!this.order.direction) {
        throw new Error("Postgres does not support Order By at Update Query");
      }

      return "";
    }
  }]);

  return UpdateBuilder;
}();

var _default = UpdateBuilder;
exports["default"] = _default;