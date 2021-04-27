import QueryBuilder from "./QueryBuilder";
import HasMany from "./HasMany";
import {Configuration, GetDriver} from "./Configuration";

class Model {

    constructor(data={}){
        this.connection = GetDriver(Configuration.default);
        this.table = `${this.constructor.name}`.toLowerCase();
        this.primaryKey = 'id';
        this.filters = [];
        this.protected = []; // Protect fields (not used on serialize method)

        this.data = data;
    }

    fill(data) {
        this.data = this.data || {};
        Object.keys(data).forEach(field => {
            if(this.hasOwnProperty(field)) this[field] = data[field];
            this.data[field] = data[field];
        });
    }

    toJSON() {
        return this.serialize();
    }

    serialize(ignore = []) {
        const fields_to_ignore = this.protected.concat(ignore || []);
        return Object.keys(this.data)
            // Remove all fields present in PROTECTED and IGNORE PARAMETER
            .filter(field => !fields_to_ignore.find(p => p === field))
            .map(field => {
                return {[field]: this.data[field]};
            })
            .reduce((c, v) => ({...c, ...v}), {});
    }

    getKeyName(){
        return this.primaryKey;
    }

    getForeignKey(){
        return `${this.constructor.name}_id`.toLowerCase();
    }

    query() {
        return new QueryBuilder(this);
    }

    static parse(data) {
        const model = (new this.prototype.constructor());
        model.fill(data);
        return model;
    }

    static query(){
        if(this instanceof Function) {
            return (new this.prototype.constructor).query();
        }
        return this.query();
    }

    static all() {
        const instance = new this.prototype.constructor;
        return instance.query().get();
    }

    static insert(bulkData, options={}){
        return this.query().insert(bulkData, options);
    }

    static create(data, options={}){
        return this.query().create(data, options);
    }

    static transaction(callback = (transaction, commit, rollback) => {}) {
        return this.query().transaction().then(query => {
            const transaction = query.transactionId, commit = () => query.commit(), rollback = () => query.rollback();
            if (callback) callback(transaction, commit, rollback);
            return {transaction, commit, rollback};
        });
    }

    save(){
        throw new Error("Save 'Model' no implemented yet");
    }

    delete(){
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

export default Model;
