import { Pool } from "pg";

import {Configuration, uuidv4} from "../Configuration";
import SelectBuilder from "./Postgres/SelectBuilder";
import InsertBuilder from "./Postgres/InsertBuilder";
import DeleteBuilder from "./Postgres/DeleteBuilder";
import UpdateBuilder from "./Postgres/UpdateBuilder";

const transactions = {};

class PostgresDriver {

    constructor() {
        const options = Object.assign({}, {
            ...Configuration.connections['pgsql']
        });
        delete options.driver;
        this.pool = new Pool(options);
    }

    async query(options, sql, params = []) {
        const connection = await this.getConnection(options);
        const parseParam = (po) => {
            let r = [];
            po.forEach(e => {
                if (Array.isArray(e)) e.forEach(a => r = r.concat(a))
                else r = r.concat(e);
            });
            return r;
        };
        console.log(sql, parseParam(params));
        const response = await connection.query(sql, parseParam(params));
        if (response.command === "SELECT") return response.rows;
        else if (response.command === "INSERT") return { affectedRows: response.rowCount, insertId: response.rows[0].id };
        return { affectedRows: response.rowCount };
    }

    getConnection(options={}) {
        if(options.hasOwnProperty("transaction")) return transactions[options.transaction];
        else return this.pool;
    }

    async commit(transaction) {
        // Validate if there is a transaction to handle
        if (!transactions.hasOwnProperty(transaction)) throw new Error("Transaction not found");
        // Get transaction connection
        const connection = transactions[transaction];
        try {
            // Commit all alteration to database
            await connection.query('COMMIT');
        } catch (err) {
            // Rollback any alteration to database
            await connection.query('ROLLBACK');
            // Pass the error forward
            throw err;
        } finally {
            // Delete connection from the cache
            delete transactions[transaction];
            // Release connection
            connection.release();
        }
    }

    async rollback(transaction){
        // Validate if there is a transaction to handle
        if (!transactions.hasOwnProperty(transaction)) throw new Error("Transaction not found");
        // Get transaction connection
        const connection = transactions[transaction];
        try {
            // Rollback any alteration to database
            await connection.query('ROLLBACK');
        } catch (err) {
            // Pass the error forward
            throw err;
        } finally {
            // Delete connection from the cache
            delete transactions[transaction];
            // Release connection
            connection.release();
        }
    }

    async transaction() {
        // Generate a random UUID for this transaction
        const id = uuidv4();
        // Get a new connection on the POOL
        const client = await this.pool.connect();
        // Add Current connection tp transaction storage
        transactions[id] = client;
        try {
            // Begin transaction
            await client.query('BEGIN');
            // return transaction ID
            return id;
        } catch (err) {
            // Rollback anything on error
            await client.query('ROLLBACK');
            // Remove current connection from the transaction storage
            delete transactions[id];
            // Release current connection
            client.release();
            // Pass the error forward
            throw err;
        }
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

export default PostgresDriver;
