import SelectBuilder from "./Drivers/Mysql/SelectBuilder";
import InsertBuilder from "./Drivers/Mysql/InsertBuilder";

const parseParams = (args, type, builder) => {
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
const parseWith = (args) => {
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

class QueryBuilder {

    constructor(model){
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
        };
        // TODO Use Proxy to block variable access
    }
//#SELECT BEGIN
    with(relation){
        parseWith(Array.from(arguments)).forEach(relation => {
            if(!this.model[relation]) throw new Error(`Eager Loader "${relation}" not found`);
            this.eagerLoader.push({ relation: this.model[relation](), name: relation });
        });
        return this;
    }

    where(){
        const data = parseParams(arguments, null, this);
        if(this.filters.length === 0) this.filters.push(data);
        else this.andWhere(...arguments);
        return this;
    }

    orWhere(){
        const data = parseParams(arguments, 'or', this);
        this.filters.push(data);
        return this;
    }

    andWhere(){
        const data = parseParams(arguments, 'and', this);
        this.filters.push(data);
        return this;
    }

    skip(skip){
        this.limit.skip = skip;
        return this;
    }

    take(take){
        this.limit.take = take;
        return this;
    }

    orderBy(column, direction){
        this.order.column = column;
        this.order.direction = direction;
        return this;
    }

    get(){
        const selectBuilder = new SelectBuilder(this.model.table, this.columns, this.filters, this.limit, this.order);
        return this.model.connection.query((connection, resolve, reject) => {
            const sqlBuilded = selectBuilder.parse();
            connection.query(sqlBuilded.sql, sqlBuilded.data, (error, data, fields) => {
                if (error) return reject(error);
                //Eager Loader
                const joinData = this.eagerLoader.map(async (join) => {
                    return await join.relation.get(join.name, data);
                });
                //Wait for the Join
                Promise.all(joinData).then(joinResponse => {
                    // If has Join Return it (Join already come with the data formatted) or the Original Data
                    if(joinResponse.length > 0) {
                        // Insert Join Data to the original Select
                        // TODO Make this Code less Ugly possible
                        resolve(data.map(d => {
                            joinResponse.forEach(join => {
                                d[join.group] = join.data.filter(val => val[join.foreignKey] === d[join.localId]);
                            });
                            return d;
                        }));
                    }
                    else resolve(data);
                }).catch(error => reject(error));
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

    first(){
        return this.take(1).get().then(data => {
            if(data.length === 1) return data[0];
            return null;
        });
    }

    firstOrFail(){
        return this.first().then(result => {
            if(!result) throw new Error("Model Not Found");
            return result;
        })
    }
//#SELECT END

//#INSERT BEGIN

    insert(data){
        if(!(data instanceof Object || data instanceof Array)){
            throw new Error("Data parameter should be an object or an array of object!");
        }
        //Transform data Into a Array if is not.
        let localData = [data];
        if(data instanceof Array){
            localData = data;
        }
        //Map Insert Columns
        const columns = [];
        for(const i in localData[0]){
            if(localData[0].hasOwnProperty(i)){
                columns.push(i);
            }
        }
        //Get Insert Values in the correct order
        const values = localData.map(data => {
            return Object.values(columns.map(column => {
                return data[column];
            }));
        });

        const insertBuilder = new InsertBuilder(this.model.table, columns, values);
        /*return insertBuilder.parse();*/

        return this.model.connection.query((connection, resolve, reject) => {
            connection.query(insertBuilder.parse(), [values], (error, data, fields) => {
                if (error) return reject(error);
                resolve(data.affectedRows > 0);
            });
        });
    }

    create(data){
        if(!(data instanceof Object)){
            throw new Error("Data parameter should be an object!");
        }
        //Map Insert Columns
        const columns = [];
        for(const i in data){
            if(data.hasOwnProperty(i)){
                columns.push(i);
            }
        }
        //Get Insert Values in the correct order
        const values = Object.values(columns.map(column => {
            return data[column];
        }));
        const insertBuilder = new InsertBuilder(this.model.table, columns, [values]);

        return this.model.connection.query((connection, resolve, reject) => {
            connection.query(insertBuilder.parse(), [[values]], (error, response, fields) => {
                if (error) return reject(error);
                resolve({
                    [this.model.primaryKey]: response.insertId,
                    ...data
                });
            });
        });
    }

//#INSERT END
}

export default QueryBuilder;
