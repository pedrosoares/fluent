import { Model } from "./model";
import { dataToModel, parseParams,  parseWith } from "./helpers";
import {HasOne} from "./has_one";
import {HasMany} from "./has_many";

class QueryBuilder {
    private connection: any;
    private model: any;
    private columns: any;
    public filters: any;
    private groups: string[];
    private eagerLoader: { relation: HasOne | HasMany, name: string }[];
    private eagerData: any;
    private eagerFilter: { relation: string; filter: (qb: QueryBuilder) => void; }[] = [];
    private limit: { skip: number | null, take: number | null };
    private order: { raw: string | null; column: string | number | null, direction: string | null }[];
    private transactionId: any;

    constructor(model: any){
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

        this.order = [];

        this.transactionId = null;

        if (this.model.softDelete) {
            this.whereNull(this.model.softDelete);
        }
    }

    transaction(): Promise<QueryBuilder> {
        return this.connection.transaction().then((id: any) => {
            this.transactionId = id;
            return this;
        });
    }

    async commit() {
        await this.connection.commit(this.transactionId);
        this.transactionId = null;
    }

    async rollback() {
        await this.connection.rollback(this.transactionId);
        this.transactionId = null;
    }

//#SELECT BEGIN
    select(fields: string[]): QueryBuilder {
        this.columns = fields;
        return this;
    }

    with(...relations: string[]): QueryBuilder {
        parseWith(Array.from(relations)).forEach(relation => {
            if(!this.model[relation]) throw new Error(`Eager Loader "${relation}" not found`);
            this.eagerLoader.push({ relation: this.model[relation](), name: relation });
        });
        return this;
    }

    whereHas(relation: string, filter: (qb: QueryBuilder) => void): QueryBuilder {
        this.eagerFilter.push({
            relation,
            filter,
        });
        return this;
    }

    whereNull(column: string): QueryBuilder {
        if(this.filters.length === 0) this.filters.push({ column, value: null, compare: "IS NULL", type: null });
        else this.andWhereNull(column);
        return this;
    }

    andWhereNull(column: string): QueryBuilder {
        this.filters.push({ column, value: null, compare: "IS NULL", type: 'and' });
        return this;
    }

    orWhereNull(column: string): QueryBuilder {
        this.filters.push({ column, value: null, compare: "IS NULL", type: 'or' });
        return this;
    }

    whereNotNull(column: string): QueryBuilder {
        if(this.filters.length === 0) this.filters.push({ column, value: null, compare: "IS NOT NULL", type: null });
        else this.andWhereNotNull(column);
        return this;
    }

    andWhereNotNull(column: string): QueryBuilder {
        this.filters.push({ column, value: null, compare: "IS NOT NULL", type: 'and' });
        return this;
    }

    orWhereNotNull(column: string): QueryBuilder {
        this.filters.push({ column, value: null, compare: "IS NOT NULL", type: 'or' });
        return this;
    }

    whereRaw(raw: string, ...args: any[]): QueryBuilder {
        if(this.filters.length === 0) this.filters.push({ raw, type: null, args })
        else this.andWhereRaw(raw, ...args);
        return this;
    }

    andWhereRaw(raw: string, ...args: any[]): QueryBuilder {
        this.filters.push({ raw, type: 'and', args });
        return this;
    }

    orWhereRaw(raw: string, ...args: any[]): QueryBuilder {
        this.filters.push({ raw, type: 'or', args });
        return this;
    }

    where(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string | number | boolean): QueryBuilder {
        const filters = [filter, val_or_compare, val].filter((v) => !!v);
        const data = parseParams(filters, null, this);
        if(this.filters.length === 0) this.filters.push(data);
        else { // @ts-ignore
            this.andWhere(...filters);
        }
        return this;
    }

    orWhere(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string | number | boolean): QueryBuilder {
        const data = parseParams([filter, val_or_compare, val].filter((v) => !!v), 'or', this);
        this.filters.push(data);
        return this;
    }

    andWhere(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string | number | boolean): QueryBuilder {
        const data = parseParams([filter, val_or_compare, val].filter((v) => !!v), 'and', this);
        this.filters.push(data);
        return this;
    }

    groupBy(...groups: string[]): QueryBuilder {
        if(this.groups.length > 0) throw new Error("Group By is not empty");
        this.groups = Object.values(groups);
        return this;
    }

    skip(skip: number): QueryBuilder {
        this.limit.skip = skip;
        return this;
    }

    take(take: number): QueryBuilder {
        this.limit.take = take;
        return this;
    }

    orderBy(column: string | number, direction: string): QueryBuilder {
        this.order.push({
            column, direction, raw: null
        });
        return this;
    }

    orderByRaw(sql: string): QueryBuilder {
        this.order.push({
            column: null, direction: null, raw: sql
        });
        return this;
    }

    async get<T extends Model>(options: any = {}): Promise<T[]> {
        // Create select
        const select = this.connection.parseSelect(this.model.table, this.columns, this.filters, this.limit, this.order, this.groups);
        // Query using driver
        let data = await this.connection.query(options, select.sql, select.data);
        // Return an empty array if there is no data to return
        if (data.length === 0) return [];
        // Eager Loader
        const joinData = this.eagerLoader.map((join: any) => {
            const joinFilter = this.eagerFilter.find(f => f.relation === join.name);
            return join.relation.get(join.name, data, joinFilter);
        });
        // Wait for the Join
        const joinResponse = await Promise.all(joinData);
        // if there is eager loader data, parse-it
        if (joinResponse.length > 0 )
            data = data.map((d: any) => {
                joinResponse.forEach(join => {
                    if (join.type === "many")
                        d[join.group] = join.data.filter((val: any) => val[join.foreignKey] === d[join.localId]);
                    else if (join.type === "one")
                        d[join.group] = join.data.find((val: any) => val[join.foreignKey] === d[join.localId]) || null;
                });
                return d;
            }).filter((d: any) => {
                return this.eagerFilter.length === 0 || this.eagerFilter.find(({ relation }) => !!d[relation])
            });
        // Return raw data
        return data.map((d: any) => dataToModel(this.model, d));
    }

    async count(options: any = {}): Promise<number> {
        const select = this.connection.parseSelect(this.model.table, ["count(*) as count"], this.filters, this.limit, [], this.groups);
        // Query using driver
        const data = await this.connection.query(options, select.sql, select.data);
        const { count } = data.find(() => true);
        return count - 0;
    }

    first<T extends Model>(options: any = {}): Promise<T | null> {
        // @ts-ignore
        return this.take(1).get(options).then((data: T[]): T | null => {
            if(data.length === 1) return data[0];
            return null;
        });
    }

    firstOrFail<T extends Model>(options: any = {}): Promise<T>{
        // @ts-ignore
        return this.first(options).then((result: T | null) => {
            if(!result) throw new Error("Model Not Found");
            return result;
        })
    }
//#SELECT END

//#INSERT BEGIN
    async insert(data: any, options: any = {}): Promise<boolean> {
        if(!(data instanceof Object || data instanceof Array)){
            throw new Error("Data parameter should be an object or an array of object!");
        }
        // Transform data Into a Array if is not.
        let localData = [data];
        if(data instanceof Array){
            localData = data;
        }
        // Map Insert Columns
        const columns: any[] = [];
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

    async create<T extends Model>(data: any, options: any = {}): Promise<T> {
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
            ...data,
            ...(response.data && response.data.length > 0 ? response.data[0] : {})
        });
    }
//#INSERT END

//#DELETE BEGIN
    async delete(options: any = {}) {
        const deleteObj = this.connection.parseDelete(this.model.table, this.filters);
        if (this.eagerLoader.length > 0) throw new Error("Do not use EagerLoader with Delete function");
        return this.connection.query(options, deleteObj.sql, deleteObj.data);
    }
//#DELETE END

//#UPDATE BEGIN
    update(data: any, options: any = {}) {
        const update = this.connection.parseUpdate(this.model.table, data, this.filters, this.limit, this.order);
        if (this.eagerLoader.length > 0) throw new Error("Do not use EagerLoader with Update function");
        return this.connection.query(options, update.sql, update.data);
    }
//#UPDATE END

//#RAW BEGIN
    raw(sql: string, params: any[]  = [], options: any = {}){
        return this.connection.query(options, sql, params);
    }
//#RAW END
}

export { QueryBuilder };
