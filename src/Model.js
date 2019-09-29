import MysqlDriver from "./Drivers/MysqlDriver";
import QueryBuilder from "./QueryBuilder";
import HasMany from "./HasMany";

class Model {

    constructor(data={}){
        this.connection = new MysqlDriver(); //TODO Fix this
        this.table = `${this.constructor.name}`.toLowerCase();
        this.primaryKey = 'id';
        this.filters = [];
        this.relations = [];
        //TODO Only Access using Proxy
        this.data = data;
    }

    getKeyName(){
        return this.primaryKey;
    }

    getForeignKey(){
        return `${this.constructor.name}_id`.toLowerCase();
    }

    query(){
        return new QueryBuilder(this);
    }

    static query(){
        if(this instanceof Function) {
            return (new this.prototype.constructor).query();
        }
        return this.query();
    }

    static all(){
        const instance = new this.prototype.constructor;
        return instance.query().get();
    }

    static insert(bulkData, options={}){
        return this.query().insert(bulkData, options);
    }

    static create(data, options={}){
        return this.query().create(data, options);
    }

    static transaction(transaction = (transaction, commit, rollback) => {}){
        return this.query().transaction().then(query => {
            transaction(query.transactionId, () => {
                query.commit();
            }, () => {
                query.rollback();
            });
        });
    }

    save(){

    }

    delete(){

    }

    hasMany(related, foreignKey=null, localKey=null){
        const $instance = new related.prototype.constructor;

        let $foreignKey = foreignKey || this.getForeignKey();

        let $localKey = localKey || this.getKeyName();

        return new HasMany(
            $instance.query(), this, $foreignKey, $localKey
        );
    }

}

export default Model;
