class TransactionsDao {
    constructor() {
        if(!this.getAccountTransactions) {
            throw new Error("TransactionsDao must implement getAccountTransactions");
        }
        if(!this.addTransaction) {
            throw new Error("TransactionsDao must implement addTransaction");
        }
    }
}
module.exports = TransactionsDao;