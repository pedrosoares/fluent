import mysql from "mysql";
import {Configuration, uuidv4} from "../Configuration";

const transactions = {};

class MysqlDriver {

    constructor(){
        const options = Object.assign({
            connectionLimit : 10
        }, Configuration.connections['mysql']);
        delete options.driver;
        this.pool  = mysql.createPool(options);
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

}

export default MysqlDriver;