import { HasMany } from "./has_many";
import { HasOne } from "./has_one";
import { QueryBuilder } from "./query.builder";
import { configurator } from "./index";

const internal_properties = ["_connection", "table", "primaryKey", "foreignKey", "filters", "protected", "relations"];

class Model {

    constructor() {
        // Connection Name
        this._connection = configurator.default_connection;
        this.table = `${this.constructor.name}`.toLowerCase();
        this.primaryKey = 'id';
        this.foreignKey = `${this.table}_id`.toLowerCase();
        this.softDelete = null; // Field Used on soft-delete
        this.filters = [];
        this.protected = []; // Protect fields (not used on serialize method)
        this.relations = {}; // Used on joins
    }

    get_connection() {
        // Get Driver based on connection name
        return configurator.get_driver(this._connection);
    }

    fill(data) {
        Object.keys(data).forEach(field => {
            if(this.hasOwnProperty(field)) this[field] = data[field];
            else if(this[field]) this.relations[field] =  data[field];
        });
    }

    toJSON() {
        return this.serialize();
    }

    serialize(ignore = []) {
        const fields_to_ignore = this.protected.concat(internal_properties).concat(ignore || []);
        return []
            .concat(Object.keys(this)) // model_keys
            .concat(Object.keys(this.relations)) // relation_keys
            // Remove all fields present in PROTECTED and IGNORE PARAMETER
            .filter(field => !fields_to_ignore.find(p => p === field))
            .map(field => {
                // Get model value by default
                let value = this[field];
                // If the value is not a property
                if(!this.hasOwnProperty(field)) {
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

    getKeyName() {
        return this.primaryKey;
    }

    getForeignKey() {
        return this.foreignKey;
    }

    query() {
        return new QueryBuilder(this);
    }

    static parse(data) {
        const model = (new this.prototype.constructor());
        model.fill(data);
        return model;
    }

    static query() {
        if(this instanceof Function) {
            return (new this.prototype.constructor).query();
        }
        return this.query();
    }

    static all() {
        const instance = new this.prototype.constructor;
        return instance.query().get();
    }

    static insert(bulkData, options={}) {
        return this.query().insert(bulkData, options);
    }

    static create(data, options={}) {
        return this.query().create(data, options);
    }

    static transaction(callback = (transaction, commit, rollback) => {}) {
        return this.query().transaction().then(query => {
            const transaction = query.transactionId, commit = () => query.commit(), rollback = () => query.rollback();
            if (callback) callback(transaction, commit, rollback);
            return {transaction, commit, rollback};
        });
    }

    async save() {
        const key_name = this.getKeyName();
        const key_value = this[key_name];
        // Validate if the Identification of the model is valid
        if(key_value === null || key_value === undefined) throw new Error(`Value for key name '${key_name}' not found`);
        // Keys to ignore
        const ignore_keys = [ key_name ]
            // Ignore all relations
            .concat(Object.keys(this.relations));
        // Update Model
        return this.query()
            .where(key_name, key_value)
            // Ignore the  model Identification
            .update(this.serialize(ignore_keys));
    }

    async delete() {
        const key_name = this.getKeyName();
        const key_value = this[key_name];
        // Validate if the Identification of the model is valid
        if(key_value === null || key_value === undefined) throw new Error(`Value for key name '${key_name}' not found`);
        // Delete Model
        return this.query()
            .where(key_name, key_value)
            .delete()
    }

    hasMany(related, foreignKey=null, localKey=null) {
        const $instance = new related.prototype.constructor;

        let $foreignKey = foreignKey || this.getForeignKey();

        let $localKey = localKey || this.getKeyName();

        return new HasMany(
            $instance.query(), related.prototype, $foreignKey, $localKey
        );
    }

    hasOne(related, foreignKey=null, localKey=null) {
        const $instance = new related.prototype.constructor;

        let $foreignKey = foreignKey || this.getForeignKey();

        let $localKey = localKey || this.getKeyName();

        return new HasOne(
            $instance.query(), related.prototype, $foreignKey, $localKey
        );
    }

}

export { Model };
