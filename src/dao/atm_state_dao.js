class AtmStateDao {
    constructor() {
        if(!this.getCashBalance) {
            throw new Error("AtmStateDao must implement getCashBalance");
        }
        if(!this.setCashBalance) {
            throw new Error("AtmStateDao must implement setCashBalance");
        }
    }
}
module.exports = AtmStateDao;