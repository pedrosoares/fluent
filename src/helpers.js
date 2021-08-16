import { QueryBuilder } from "./query.builder";

export const dataToModel = (model, data) => {
    const instance = new model.constructor();
    instance.fill(data);
    return instance;
};

export const parseParams = (args, type, builder) => {
    let value = null;
    let compare = '=';
    switch (args.length){
        case 3:
            compare = args[1];
            value = args[2];
            break;

        case 2:
            value = args[1];
            break;

        case 1:
            if(args[0] instanceof Function) {
                const b = new QueryBuilder(builder.model);
                args[0](b);
                return { type, filter: b.filters };
            } else
                throw new Error("Parameter should be a function a column and value or a column, comparation and value");

        default:
            throw new Error("Invalid number of parameters");
    }
    return { column: args[0], value, compare, type };
};

export const parseWith = (args) => {
    if(args.length === 0) throw new Error("With needs 1 or more parameters");
    let relations = [];
    args.forEach(arg => {
        if(arg instanceof Array) {
            relations = relations.concat(parseWith(arg));
        } else
            relations.push(arg);
    });
    return relations;
};
