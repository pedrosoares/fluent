import mysql from "mysql";

class MysqlDriver {

    constructor(options={}){
        this.options = Object.assign({
            host     : process.env.DB_HOST || '127.0.0.1',
            user     : process.env.DB_USERNAME || 'root',
            password : process.env.DB_PASSWORD || '1234',
            database : process.env.DB_DATABASE || 'database'
        }, options);
    }

    query(callback){
        return new Promise((resolve, reject) => {
            const connection = mysql.createConnection(this.options);
            connection.connect();
            callback(connection, (a) => {
                resolve(a);
                connection.end();
            }, (a) => {
                reject(a);
                connection.end();
            });
        });
    }

}

export default MysqlDriver;