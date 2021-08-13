"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HasMany = void 0;

var _helpers = require("./helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HasMany = /*#__PURE__*/function () {
  function HasMany(queryBuilder, model, foreignKey, localId) {
    _classCallCheck(this, HasMany);

    this.queryBuilder = queryBuilder;
    this.model = model;
    this.foreignKey = foreignKey;
    this.localId = localId;
  }

  _createClass(HasMany, [{
    key: "parse",
    value: function parse() {
      var _this = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      //Find the Key of Search
      return data.map(function (d) {
        if (d.hasOwnProperty(_this.localId)) return d[_this.localId];
        return null;
      }) //Remove NULL Values
      .filter(function (d) {
        return !!d;
      });
    }
  }, {
    key: "get",
    value: function get(group) {
      var _this2 = this;

      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var parentIds = this.parse(data);
      if (parentIds.length === 0) return null;
      var firstId = parentIds.pop();
      this.queryBuilder.where(this.foreignKey, firstId);
      parentIds.forEach(function (id) {
        return _this2.queryBuilder.orWhere(_this2.foreignKey, id);
      });
      return this.queryBuilder.get().then(function (response) {
        return {
          type: "many",
          group: group,
          foreignKey: _this2.foreignKey,
          localId: _this2.localId,
          data: response.map(function (data) {
            return (0, _helpers.dataToModel)(_this2.model, data);
          })
        };
      });
    }
  }]);

  return HasMany;
}();

exports.HasMany = HasMany;