const AccountsDao = require("../accounts_dao");

const sqlite = require("better-sqlite3");
const db = new sqlite('accounts_db');
const csv = require('csv-parser');
const fs = require('fs');

class SqliteAccountsDao extends AccountsDao {
    constructor() {
        super();
    }

    initialize(accounts_data_file) {
        console.log("bootstrapping SqlliteAccountsDao");
        // create table if doesn't exist.
        db.exec( 'CREATE TABLE IF NOT EXISTS accounts ( id LONG, pin VARCHAR(4), balance REAL );');

        // load if empty
        let row = db.prepare('SELECT count(*) as count FROM accounts').get();
        console.log(`row count : ${row.count}`)
        if (row.count === undefined || row.count === 0) {
            console.log("Needs to load accounts data");
            const insrow = db.prepare( 'insert into accounts ( id, pin, balance ) VALUES (?, ?, ?)' );
            fs.createReadStream(accounts_data_file)
            .pipe(csv({"separator":","}))
            .on('data', (row) => {
                console.log("logging row: " + row);
                insrow.run( row.ACCOUNT_ID, row.PIN, row.BALANCE);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            });
        }
    }

    getAccountPin(account_id) {
        if (account_id === null || account_id === undefined) {
            return null;
        }
        let row = db.prepare(`SELECT pin FROM accounts WHERE id = ?`).get(account_id);
        
        if (row === undefined) {
            return null;
        }
        return row.pin;
    }

    getAccountBalance(account_id) {
        if (account_id === null || account_id === undefined) {
            throw new Error("A valid account_id is required for finding balance");
        }
        let row = db.prepare(`SELECT balance FROM accounts WHERE id = ?`).get(account_id);
        
        if (row === undefined) {
            throw new Error("A valid account_id is required for finding balance");
        }
        return row.balance;
    }
    setAccountBalance(account_id, balance) {
        console.log("seeing account balance to : " + balance)
        if (account_id === null || account_id === undefined) {
            throw new Error("A valid account_id is required for finding balance");
        }
        db.prepare(`UPDATE accounts SET balance=? WHERE id=?`).run(balance, account_id);
    }
}
module.exports = SqliteAccountsDao;