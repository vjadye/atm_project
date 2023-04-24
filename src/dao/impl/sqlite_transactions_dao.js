const TransactionsDao = require("../transactions_dao");

const sqlite = require("better-sqlite3");
const db = new sqlite('transactions_db');

class SqliteTransactionsDao extends TransactionsDao {
    constructor() {
        super();
    }

    initialize() {
        console.log("bootstrapping SqliteTransactionsDao");
        // create table if doesn't exist.
        db.exec( 'CREATE TABLE IF NOT EXISTS transactions ( id INTEGER PRIMARY KEY AUTOINCREMENT, account_id LONG, time DATETIME, amount REAL, balance REAL );');
    }

    getAccountTransactions(account_id) {
        if (account_id === null || account_id === undefined) {
            return null;
        }
        let row = db.prepare(`SELECT time, amount, balance FROM transactions WHERE account_id = ? ORDER BY time DESC`).all(account_id);

        if (row === undefined) {
            return null;
        }
        return row;
    }
    addTransaction(account_id, timestamp, amount, balance) {
        console.log(`adding a transaction ${account_id}, ${timestamp}, ${amount}, ${balance}`);
        db.prepare(`INSERT INTO transactions (account_id,time,amount,balance) VALUES(?,?,?,?)`).run(account_id, timestamp, amount, balance);
    }
}

module.exports = SqliteTransactionsDao