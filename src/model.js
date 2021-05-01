import { HasMany } from "./has_many";
import { QueryBuilder } from "./query.builder";
import { configurator } from "./index";

const internal_properties = ["connection", "table", "primaryKey", "filters", "protected"];

class Model {

    constructor() {
        // Connection Name
        this.connection = configurator.default_connection;
        this.table = `${this.constructor.name}`.toLowerCase();
        this.primaryKey = 'id';
        this.foreignKey = `${this.table}_id`.toLowerCase();
        this.filters = [];
        this.protected = []; // Protect fields (not used on serialize method)
    }

    get_connection() {
        // Get Driver based on connection name
        return configurator.get_driver(this.connection);
    }

    fill(data) {
        Object.keys(data).forEach(field => {
            if(this.hasOwnProperty(field)) this[field] = data[field];
        });
    }

    toJSON() {
        return this.serialize();
    }

    serialize(ignore = []) {
        const fields_to_ignore = this.protected.concat(internal_properties).concat(ignore || []);
        return Object.keys(this)
            // Remove all fields present in PROTECTED and IGNORE PARAMETER
            .filter(field => !fields_to_ignore.find(p => p === field))
            .map(field => {
                return {[field]: this[field]};
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

    save() {
        throw new Error("Save 'Model' no implemented yet");
    }

    delete() {
        throw new Error("Delete 'Model' no implemented yet");
    }

    hasMany(related, foreignKey=null, localKey=null) {
        const $instance = new related.prototype.constructor;

        let $foreignKey = foreignKey || this.getForeignKey();

        let $localKey = localKey || this.getKeyName();

        return new HasMany(
            $instance.query(), this, $foreignKey, $localKey
        );
    }

}

export { Model };
