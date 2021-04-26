import mysql from "mysql";
import {Configuration, uuidv4} from "../Configuration";
import SelectBuilder from "./Mysql/SelectBuilder";
import InsertBuilder from "./Mysql/InsertBuilder";
import DeleteBuilder from "./Mysql/DeleteBuilder";
import UpdateBuilder from "./Mysql/UpdateBuilder";

const transactions = {};

class MysqlDriver {

    constructor(){
        const options = Object.assign({
            connectionLimit : 10
        }, Configuration.connections['mysql']);
        delete options.driver;
        this.pool  = mysql.createPool(options);
    }

    query(options, sql, params) {
        const connection = this.getConnection(options);
        return new Promise((resolve, reject) => connection.query(sql, params, (error, data, _) => {
            if (error) return reject(error);
            resolve(data);
        }));
    }

    getConnection(options={}){
        if(options.hasOwnProperty("transaction"))
            return transactions[options.transaction];
        else
            return this.pool;
    }

    commit(transaction) {
        const connection = transactions[transaction];
        connection.commit((err) => {
            if (err) {
                return connection.rollback(() => {
                    connection.release();
                    throw err;
                });
            }
            connection.release();
        });
        delete transactions[transaction];
    }

    rollback(transaction){
        const connection = transactions[transaction];
        connection.rollback(() => {
            connection.release();
        });
        delete transactions[transaction];
    }

    transaction(){
        const id = uuidv4();
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) reject(err);
                else
                    connection.beginTransaction((err) => {
                        if (err) {
                            connection.rollback(function() {
                                connection.release();
                            });
                            reject('Could`t get a connection!');
                        } else {
                            transactions[id] = connection;
                            resolve(id);
                        }
                    });
            });
        });
    }

    parseSelect(table, columns, filters, limit, order, groups){
        return (new SelectBuilder(table, columns, filters, limit, order, groups)).parse();
    }

    parseInsert(table, columns, values){
        return (new InsertBuilder(table, columns, values)).parse();
    }

    parseDelete(table, filters){
        return (new DeleteBuilder(table, filters)).parse();
    }

    parseUpdate(table, columns, filters, limit, order){
        return (new UpdateBuilder(table, columns, filters, limit, order)).parse();
    }

}

export default MysqlDriver;
