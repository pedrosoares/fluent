"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseWith = exports.parseParams = exports.dataToModel = void 0;

var dataToModel = function dataToModel(model, data) {
  var instance = new model.constructor();
  instance.fill(data);
  return instance;
};

exports.dataToModel = dataToModel;

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

exports.parseParams = parseParams;

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

exports.parseWith = parseWith;