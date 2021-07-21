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

const dataToModel = (model, data) => {
    const instance = new model.constructor();
    instance.fill(data);
    return instance;
};

class QueryBuilder {

    constructor(model){
        this.connection = model.get_connection(); // Get database connection from the model

        this.model = model; // Current model

        this.columns = ['*']; //USED BY SelectBuilder

        this.filters = []; //USED BY WhereBuilder

        this.groups = []; //USED BY GroupBuilder

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

        this.transactionId = null;
    }

    transaction(){
        return this.connection.transaction().then(id => {
            this.transactionId = id;
            return this;
        });
    }

    commit(){
        this.connection.commit(this.transactionId);
        this.transactionId = null;
    }

    rollback(){
        this.connection.rollback(this.transactionId);
        this.transactionId = null;
    }

//#SELECT BEGIN
    with(relation){
        parseWith(Array.from(arguments)).forEach(relation => {
            if(!this.model[relation]) throw new Error(`Eager Loader "${relation}" not found`);
            this.eagerLoader.push({ relation: this.model[relation](), name: relation });
        });
        return this;
    }

    whereRaw(raw) {
        if(this.filters.length === 0) this.filters.push({ raw, type: null })
        else this.andWhereRaw(raw);
        return this;
    }

    andWhereRaw(raw) {
        this.filters.push({ raw, type: 'and' });
        return this;
    }

    orWhereRaw(raw) {
        this.filters.push({ raw, type: 'or' });
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

    groupBy(){
        if(this.groups.length > 0) throw new Error("Group By is not empty");
        this.groups = Object.values(arguments);
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

    async get(options={}) {
        const select = this.connection.parseSelect(this.model.table, this.columns, this.filters, this.limit, this.order, this.groups);
        // Query using driver
        const data = await this.connection.query(options, select.sql, select.data);
        // Eager Loader
        const joinData = this.eagerLoader.map(async (join) => {
            return await join.relation.get(join.name, data);
        });
        // Wait for the Join
        const joinResponse = await Promise.all(joinData);
        // if there is eager loader data, parse-it
        if (joinResponse.length > 0 )
            return data.map(d => {
                joinResponse.forEach(join => {
                    d[join.group] = join.data.filter(val => val[join.foreignKey] === d[join.localId]).map(dt => dataToModel(this.model, dt));
                });
                return dataToModel(this.model, d);
            });
        // Return raw data
        else return data.map(d => dataToModel(this.model, d));
    }

    async count(options={}) {
        const select = this.connection.parseSelect(this.model.table, ["count(*) as count"], this.filters, this.limit, this.order, this.groups);
        // Query using driver
        const data = await this.connection.query(options, select.sql, select.data);
        const { count } = data.find(() => true);
        return count - 0;
    }

    first(options={}){
        return this.take(1).get(options).then(data => {
            if(data.length === 1) return data[0];
            return null;
        });
    }

    firstOrFail(options={}){
        return this.first(options).then(result => {
            if(!result) throw new Error("Model Not Found");
            return result;
        })
    }
//#SELECT END

//#INSERT BEGIN
    async insert(data, options={}) {
        if(!(data instanceof Object || data instanceof Array)){
            throw new Error("Data parameter should be an object or an array of object!");
        }
        // Transform data Into a Array if is not.
        let localData = [data];
        if(data instanceof Array){
            localData = data;
        }
        // Map Insert Columns
        const columns = [];
        for(const i in localData[0]){
            if(localData[0].hasOwnProperty(i)){
                columns.push(i);
            }
        }
        // Get Insert Values in the correct order
        const values = localData.map(data => {
            return Object.values(columns.map(column => {
                return data[column];
            }));
        });
        // Generate insert SQL
        const insert_sql = this.connection.parseInsert(this.model.table, columns, values);
        // Perform insert
        const response = await this.connection.query(options, insert_sql, [values]);
        // Return if was inserted or not
        return response.affectedRows > 0;
    }

    async create(data, options={}){
        if (!(data instanceof Object)) {
            throw new Error("Data parameter should be an object!");
        }
        // Map Insert Columns
        const columns = [];
        for (const i in data) {
            if(data.hasOwnProperty(i)){
                columns.push(i);
            }
        }
        // Get Insert Values in the correct order
        const values = Object.values(columns.map(column => {
            return data[column];
        }));
        // Generate insert SQL
        const insert_sql = this.connection.parseInsert(this.model.table, columns, [values]);
        // Perform insert
        const response = await this.connection.query(options, insert_sql, [values]);
        return dataToModel(this.model, {
            [this.model.primaryKey]: response.insertId,
            ...data
        });
    }
//#INSERT END

//#DELETE BEGIN
    async delete(options={}){
        const deleteObj = this.connection.parseDelete(this.model.table, this.filters);
        if (this.eagerLoader.length > 0) throw new Error("Do not use EagerLoader with Delete function");
        return this.connection.query(options, deleteObj.sql, deleteObj.data);
    }
//#DELETE END

//#UPDATE BEGIN
    update(data, options={}){
        const update = this.connection.parseUpdate(this.model.table, data, this.filters, this.limit, this.order);
        if (this.eagerLoader.length > 0) throw new Error("Do not use EagerLoader with Update function");
        return this.connection.query(options, update.sql, update.data);
    }
//#UPDATE END

//#RAW BEGIN
    raw(sql, params = [], options={}){
        return this.connection.query(options, sql, params);
    }
//#RAW END
}

export { QueryBuilder };
