class AccountsDao {
    constructor() {
        if(!this.getAccountPin) {
            throw new Error("AccountsDao must implement getAccountPin");
        }
        if(!this.getAccountBalance) {
            throw new Error("AccountsDao must implement getAccountBalance");
        }
        if(!this.setAccountBalance) {
            throw new Error("AccountsDao must implement setAccountBalance");
        }
    }
}
module.exports = AccountsDao;