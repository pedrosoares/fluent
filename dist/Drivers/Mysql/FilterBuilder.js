"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FilterBuilder =
/*#__PURE__*/
function () {
  function FilterBuilder(filters) {
    _classCallCheck(this, FilterBuilder);

    this.filters = filters;
  }

  _createClass(FilterBuilder, [{
    key: "typerize",
    value: function typerize(type) {
      if (!type) return '';

      switch (type) {
        case 'and':
          return ' AND';

        case 'or':
          return ' OR';

        default:
          throw new Error("Invalid filter type");
      }
    }
  }, {
    key: "columnrize",
    value: function columnrize(column) {
      return "`".concat(column, "`");
    }
  }, {
    key: "comparize",
    value: function comparize(compare) {
      //TODO validate all comparation types
      return compare;
    }
  }, {
    key: "parse",
    value: function parse() {
      var _this = this;

      if (this.filters.length === 0) return "";
      var values = [];

      var parseFunction = function parseFunction(filter) {
        if (filter instanceof Object && !!filter.filter) {
          var type = _this.typerize(filter.type);

          return ["".concat(type, " (")].concat(_toConsumableArray(filter.filter.map(parseFunction)), [') ']).join('');
        } else if (filter instanceof Object) {
          var _type = _this.typerize(filter.type);

          var column = _this.columnrize(filter.column);

          var compare = _this.comparize(filter.compare);

          values.push(filter.value);
          return "".concat(_type, " ").concat(column, " ").concat(compare, " ?");
        } else {
          throw new Error("Invalid filter object type");
        }
      };

      var result = this.filters.map(parseFunction).join('');
      return {
        sql: "WHERE".concat(result),
        data: values
      };
    }
  }]);

  return FilterBuilder;
}();

var _default = FilterBuilder;
exports["default"] = _default;