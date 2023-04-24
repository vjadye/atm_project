class TransactionsExecutor {
    constructor(accounts_dao, transactions_dao, atm_state_dao) {
        this.accounts_dao = accounts_dao;
        this.transactions_dao = transactions_dao;
        this.atm_state_dao = atm_state_dao;
    }

    withdraw(account_id, amount) {
        console.log(`executing withdraw request for account_id : ${account_id} for amount : ${amount}`);

        let balance = this.accounts_dao.getAccountBalance(account_id);

        if (balance <= 0.0) {
            //overdrafted account - return.
            return 'Your account is overdrawn! You may not make withdrawals at this time.';
        }

        let atm_cash = this.atm_state_dao.getCashBalance();

        if (atm_cash < 20.0) {
            return 'Unable to process your withdrawal at this time.';
        }

        // withdrawal amount is smaller of nearest multiple of 20 of the ATM cash and requested amount
        const available_cash = Math.floor(atm_cash/20) * 20;
        const elligible_withdrawal_amount = Math.floor(amount/20) * 20;
        let withdrawal_amount = Math.min(available_cash, elligible_withdrawal_amount);

        let new_balance = balance - withdrawal_amount;
        this.atm_state_dao.setCashBalance(atm_cash - withdrawal_amount);
        this.accounts_dao.setAccountBalance(account_id, new_balance);
        this.transactions_dao.addTransaction(account_id, this.__getCurrentDateInSQLDateTime(), -1 * withdrawal_amount, new_balance);

        let result_string = `Amount dispensed: $${withdrawal_amount}\n`
        if (new_balance < 0) {
            // Handle overdraw
            new_balance = new_balance - 5;
            result_string = `Amount dispensed: $${withdrawal_amount}\nYou have been charged an overdraft fee of $5. `
            this.accounts_dao.setAccountBalance(account_id, new_balance);
            this.transactions_dao.addTransaction(account_id, this.__getCurrentDateInSQLDateTime(), -5, new_balance);
        }

        if (withdrawal_amount < amount) {
            result_string = `Unable to dispense full amount requested at this time.` + result_string;
        }
        return result_string + this._returnCurrentBalanceFormatted(
            new_balance.toFixed(2));
    }

    deposit(account_id, amount) {
        let timestamp = this.__getCurrentDateInSQLDateTime();
        let new_balance = this.accounts_dao.getAccountBalance(account_id) + amount;

        console.log(`executing deposit request for account_id : ${account_id} for amount : ${amount}`);
        console.log(`new balance is ${new_balance}`)

        // FOR now I am not handling error conditions here. 
        // Handle cases where setAccountBalance fails or addTransaction fails.
        this.accounts_dao.setAccountBalance(account_id, new_balance);
        this.transactions_dao.addTransaction(account_id, timestamp, amount, new_balance);
        
        return this._returnCurrentBalanceFormatted(
            new_balance.toFixed(2));
    }

    balance(account_id) {
        console.log(`executing balance request for account_id : ${account_id}`);
        return this._returnCurrentBalanceFormatted(
            this.accounts_dao.getAccountBalance(account_id).toFixed(2));
    }

    _returnCurrentBalanceFormatted(balance) {
        return `Current balance: ${balance}`
    }

    history(account_id) {
        console.log(`executing history request for account_id : ${account_id}`);

        let transactions = this.transactions_dao.getAccountTransactions(account_id);
        if (transactions === null || transactions === undefined) {
            return ''; // No history available.
        }
        console.log(transactions);
        return this.__generateHistory(transactions);
    }

    __generateHistory(transactions) {
        // Generate a multi-line string where row is space separated line from transactions
        let history = '';
        transactions.forEach(row => {
            let balance = row.balance.toFixed(2);
            history = history + `${row.time} ${row.amount} ${balance}\n`
        });
        return history;
    }

    __getCurrentDateInSQLDateTime() {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}

module.exports = TransactionsExecutor