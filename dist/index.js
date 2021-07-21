"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Model", {
  enumerable: true,
  get: function get() {
    return _model.Model;
  }
});
exports.configurator = void 0;

require("@babel/polyfill");

var _model = require("./model");

var _configurator = require("./configurator");

var configurator = new _configurator.Configurator();
exports.configurator = configurator;