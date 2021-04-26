"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var InsertBuilder = /*#__PURE__*/function () {
  function InsertBuilder(table, columns, values) {
    _classCallCheck(this, InsertBuilder);

    this.table = table;
    this.columns = columns;
    this.values = values;
  }

  _createClass(InsertBuilder, [{
    key: "tablerize",
    value: function tablerize(column) {
      return "\"".concat(column, "\"");
    }
  }, {
    key: "parse",
    value: function parse() {
      var _this = this;

      var index = 0;
      var fields = this.columns.map(function (c) {
        return _this.tablerize(c);
      }).join(',');
      var values = this.values.map(function () {
        return "(".concat(_this.columns.map(function () {
          return "$".concat(++index);
        }).join(", "), ")");
      }).join(', ');
      return "INSERT INTO ".concat(this.tablerize(this.table), " (").concat(fields, ") VALUES ").concat(values, " RETURNING *;");
    }
  }]);

  return InsertBuilder;
}();

var _default = InsertBuilder;
exports["default"] = _default;