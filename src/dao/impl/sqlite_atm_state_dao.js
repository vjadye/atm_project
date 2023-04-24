const AtmStateDao = require("../atm_state_dao");

const sqlite = require("better-sqlite3");
const db = new sqlite('atm_state_db');

const ATM_ID = 1;
const ATM_INITIAL_BALANCE = 10000;

class SqliteAtmStateDao extends AtmStateDao {
    constructor() {
        super();
    }

    initialize() {
        console.log("bootstrapping SqliteAtmStateDao");
        // create table if doesn't exist.
        db.exec( 'CREATE TABLE IF NOT EXISTS atmState ( id INTEGER, cash LONG);');

        let row = db.prepare('SELECT count(*) as count FROM atmState').get();
        console.log(`row count : ${row.count}`)
        if (row.count === undefined || row.count === 0) {
            db.prepare(`INSERT INTO atmState (id,cash) VALUES(?,?)`).run(ATM_ID, ATM_INITIAL_BALANCE);
        }
    }

    getCashBalance() {
        return db.prepare('SELECT cash FROM atmState WHERE id = ?').get(ATM_ID).cash;
    }

    setCashBalance(cash_balance) {
        db.prepare(`UPDATE atmState SET cash=? WHERE id=?`).run(cash_balance, ATM_ID);
    }
}
module.exports = SqliteAtmStateDao;