import { HasMany } from "./has_many";
import { HasOne } from "./has_one";
import { QueryBuilder } from "./query.builder";
import { configurator } from "./index";

const internal_properties = [
    "_connection", "table", "primaryKey", "foreignKey", "filters", "protected", "relations", "softDelete", "virtual",
    "fillDefined"
];

class Model {
    private readonly _connection: any;
    protected table: string;
    protected primaryKey: string;
    protected foreignKey: string;
    protected softDelete: string | null;
    protected fillDefined: boolean;
    protected filters: any[];
    protected protected: any[];
    protected virtual: any[];
    public relations: any;

    constructor() {
        // Connection Name
        this._connection = configurator.default_connection;
        this.table = `${this.constructor.name}`.toLowerCase();
        this.primaryKey = 'id';
        this.foreignKey = `${this.table}_id`.toLowerCase();
        this.softDelete = null; // Field Used on soft-delete
        this.fillDefined = true; // Only fill defined properties
        this.filters = [];
        this.protected = []; // Protect fields (not used on serialize method)
        this.relations = {}; // Used on joins
        this.virtual = []; // virtual fields (create new property on serialization)
    }

    get_connection() {
        // Get Driver based on connection name
        return configurator.get_driver(this._connection);
    }

    fill(data: any) {
        const is_property = (field: any, obj: any) => obj.hasOwnProperty(field) && typeof obj[field] !== "function";
        const is_method = (field: any, obj: any) => !!obj[field] && typeof obj[field] === "function";
        Object.keys(data).forEach(field => {
            if(is_method(field, this)) this.relations[field] = data[field];
            else if(is_property(field, this) || !this.fillDefined) {
                // @ts-ignore
                this[field] = data[field];
            }
        });
    }

    toJSON(): any {
        return this.serialize();
    }

    serialize(ignore?: string[]): any {
        const fields_to_ignore = this.protected
            // Ignore Internal Fields
            .concat(internal_properties)
            // Ignore additional fields
            .concat(ignore || []);
        return []
            // @ts-ignore
            .concat(Object.keys(this)) // model_keys
            // @ts-ignore
            .concat(Object.keys(this.relations)) // relation_keys
            // @ts-ignore
            .concat(this.virtual) // relation_keys
            // Remove all fields present in PROTECTED and IGNORE PARAMETER
            .filter(field => !fields_to_ignore.find(p => p === field))
            .map(field => {
                // Get model value by default
                let value: any = this[field];

                // If the value is not a property
                if(!this.hasOwnProperty(field) && !this.virtual.some(v => v === field)) {
                    // Get relation value
                    value = this.relations[field];
                    // If relation value exists serialize-it
                    if (value)
                        // If relation is an Array map-serialize
                        if (Array.isArray(value)) value = value.map(val => val.serialize());
                        // If is an Model, serialize-it
                        else value = value.serialize();
                }
                // Return new Raw Object
                return { [field]: value };
            })
            .reduce((c, v) => ({...c, ...v}), {});
    }

    getKeyName(): string {
        return this.primaryKey;
    }

    getForeignKey(): string {
        return this.foreignKey;
    }

    query(): QueryBuilder {
        return new QueryBuilder(this);
    }

    static parse<T extends Model>(data: object): T {
        // @ts-ignore
        const model = (new this.prototype.constructor());
        model.fill(data);
        return model;
    }

    static query(): QueryBuilder {
        if(this instanceof Function) {
            // @ts-ignore
            return (new this.prototype.constructor).query();
        }
        // @ts-ignore
        return this.query();
    }

    static all<T extends Model>(): T[] {
        // @ts-ignore
        const instance = new this.prototype.constructor;
        return instance.query().get();
    }

    static insert(bulkData: object[], options?: object): Promise<boolean> {
        return this.query().insert(bulkData, options);
    }

    static create<T extends Model>(data: object, options?: object): Promise<T> {
        return this.query().create(data, options);
    }

    static transaction(callback?: (transaction: string, commit: ()=> Promise<void>, rollback: ()=> Promise<void>)=> void): Promise<{transaction: string, commit: ()=> Promise<void>, rollback: ()=> Promise<void>}> {
        return this.query().transaction().then((query: any) => {
            const transaction = query.transactionId, commit = () => query.commit(), rollback = () => query.rollback();
            if (callback) callback(transaction, commit, rollback);
            return {transaction, commit, rollback};
        });
    }

    async save(options: any = {}) {
        const key_name = this.getKeyName();
        // @ts-ignore
        const key_value = this[key_name];
        // Validate if the Identification of the model is valid
        if(key_value === null || key_value === undefined) throw new Error(`Value for key name '${key_name}' not found`);
        // Keys to ignore
        const ignore_keys = [ key_name ]
            // Ignore all relations
            .concat(Object.keys(this.relations))
            .concat(this.virtual);
        // Update Model
        return this.query()
            .where(key_name, key_value)
            // Ignore the  model Identification
            .update(this.serialize(ignore_keys as any), options);
    }

    async delete(options: any = {}) {
        const key_name: any = this.getKeyName();
        // @ts-ignore
        const key_value = this[key_name];
        // Validate if the Identification of the model is valid
        if(key_value === null || key_value === undefined) throw new Error(`Value for key name '${key_name}' not found`);

        const query = this.query().where(key_name, key_value);

        if (!this.softDelete) {
            // Delete Model
            return query.delete(options);
        } else {
            // Soft-Delete Model
            return query.update({
                [this.softDelete]: new Date()
            }, options);
        }
    }

    hasMany<T extends typeof Model>(related: T, foreignKey: string | null, localKey: string | null): HasMany {
        // @ts-ignore
        const $instance = new related.prototype.constructor;

        let $foreignKey = foreignKey || this.getForeignKey();

        let $localKey = localKey || this.getKeyName();

        return new HasMany(
            $instance.query(), related.prototype, $foreignKey, $localKey
        );
    }

    hasOne<T extends typeof Model>(related: T, foreignKey: string | null, localKey: string | null): HasOne {
        // @ts-ignore
        const $instance = new related.prototype.constructor;

        let $foreignKey = foreignKey || this.getForeignKey();

        let $localKey = localKey || this.getKeyName();

        return new HasOne(
            $instance.query(), related.prototype, $foreignKey, $localKey
        );
    }

}

export { Model };
