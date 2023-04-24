const TransactionsExecutor = require('../../src/transactions/transactions_executor');

test('account balance', () => {
    let test_account_id = "test_account_id";
    let test_account_balance = 10.000000; // only expect first two digit after decimal to be printed

    let accounts_dao = {
        getAccountBalance: function(account_id) {
            if (account_id === test_account_id) {
                return test_account_balance;
            }
        }
    };
    let transactions_dao = {};
    let atm_state_dao = {};
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.balance(test_account_id)).toBe('Current balance: 10.00');
});

test('transactions history null', () => {
    let test_account_id = "test_account_id";
    
    let accounts_dao = {
    };
    let transactions_dao = {
        getAccountTransactions: function(account_id) {
            if (account_id === test_account_id) {
                return null;
            }
        }
    };
    let atm_state_dao = {};
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.history(test_account_id)).toBe('');
});

test('transactions history valid', () => {
    let test_account_id = "test_account_id";
    
    let valid_ordered_history = [
        {
            time: 'timestamp1',
            amount: 10,
            balance: 100
        },
        {
            time: 'timestamp2',
            amount: -10,
            balance: 90
        }
    ]
    let accounts_dao = {
    };
    let transactions_dao = {
        getAccountTransactions: function(account_id) {
            if (account_id === test_account_id) {
                return valid_ordered_history;
            }
        }
    };
    let atm_state_dao = {};
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.history(test_account_id)).toBe("timestamp1 10 100.00\ntimestamp2 -10 90.00\n");
});

test('deposit', () => {
    let test_account_id = "test_account_id";
    let accounts_dao = {
        _balances: {
            test_account_id: 10
        },
        getAccountBalance: function(account_id) {
            return this._balances[account_id];
        },
        setAccountBalance: function(account_id, balance) {
            this._balances[account_id] = balance;
        }
    };
    let transactions_dao = {
        _transactions: [],
        addTransaction: function(account_id, timestamp, amount, new_balance) {
            this._transactions.push({account_id: account_id, timestamp: timestamp, amount: amount, balance: new_balance});
        }
    };
    let atm_state_dao = {};
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.deposit(test_account_id, 10)).toBe("Current balance: 20.00");
    expect(accounts_dao.getAccountBalance(test_account_id)).toBe(20);
    expect(transactions_dao._transactions[0].account_id).toBe(test_account_id);
    expect(transactions_dao._transactions[0].amount).toBe(10);
    expect(transactions_dao._transactions[0].balance).toBe(20);
    // TODO: add validation for timestamp
});

test('withdraw overdrafted account', () => {
    let test_account_id = "test_account_id";
    let accounts_dao = {
        _balances: {
            test_account_id: -1
        },
        getAccountBalance: function(account_id) {
            return this._balances[account_id];
        },
        setAccountBalance: function(account_id, balance) {
            this._balances[account_id] = balance;
        }
    };
    let transactions_dao = {
        _transactions: [],
        addTransaction: function(account_id, timestamp, amount, new_balance) {
            this._transactions.push({account_id: account_id, timestamp: timestamp, amount: amount, balance: new_balance});
        }
    };
    let atm_state_dao = {};
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.withdraw(test_account_id, 10)).toBe("Your account is overdrawn! You may not make withdrawals at this time.");
    expect(accounts_dao.getAccountBalance(test_account_id)).toBe(-1);
    expect(transactions_dao._transactions.length).toBe(0);
});

test('low atm cash', () => {
    let test_account_id = "test_account_id";
    let accounts_dao = {
        _balances: {
            test_account_id: 100
        },
        getAccountBalance: function(account_id) {
            return this._balances[account_id];
        },
        setAccountBalance: function(account_id, balance) {
            this._balances[account_id] = balance;
        }
    };
    let transactions_dao = {
        _transactions: [],
        addTransaction: function(account_id, timestamp, amount, new_balance) {
            this._transactions.push({account_id: account_id, timestamp: timestamp, amount: amount, balance: new_balance});
        }
    };
    let atm_state_dao = {
        getCashBalance: function() {
            return 0;
        }
    };
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.withdraw(test_account_id, 10)).toBe("Unable to process your withdrawal at this time.");
    expect(accounts_dao.getAccountBalance(test_account_id)).toBe(100);
    expect(transactions_dao._transactions.length).toBe(0);
});

test('enough cash - withdrawal not multiple of 20', () => {
    let test_account_id = "test_account_id";
    let accounts_dao = {
        _balances: {
            test_account_id: 100
        },
        getAccountBalance: function(account_id) {
            return this._balances[account_id];
        },
        setAccountBalance: function(account_id, balance) {
            this._balances[account_id] = balance;
        }
    };
    let transactions_dao = {
        _transactions: [],
        addTransaction: function(account_id, timestamp, amount, new_balance) {
            this._transactions.push({account_id: account_id, timestamp: timestamp, amount: amount, balance: new_balance});
        }
    };
    let atm_state_dao = {
        _balance: 1000,
        getCashBalance: function() {
            return this._balance;
        },
        setCashBalance: function(balance) {
            this._balance = balance;
        }
    };
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.withdraw(test_account_id, 90))
    .toBe("Unable to dispense full amount requested at this time.Amount dispensed: $80\nCurrent balance: 20.00");
    expect(accounts_dao.getAccountBalance(test_account_id)).toBe(20);
    expect(transactions_dao._transactions[0].account_id).toBe(test_account_id);
    expect(transactions_dao._transactions[0].amount).toBe(-80);
    expect(transactions_dao._transactions[0].balance).toBe(20);
    // TODO: add validation for timestamp
});

test('enough cash - withdrawal multiple of 20', () => {
    let test_account_id = "test_account_id";
    let accounts_dao = {
        _balances: {
            test_account_id: 100
        },
        getAccountBalance: function(account_id) {
            return this._balances[account_id];
        },
        setAccountBalance: function(account_id, balance) {
            this._balances[account_id] = balance;
        }
    };
    let transactions_dao = {
        _transactions: [],
        addTransaction: function(account_id, timestamp, amount, new_balance) {
            this._transactions.push({account_id: account_id, timestamp: timestamp, amount: amount, balance: new_balance});
        }
    };
    let atm_state_dao = {
        _balance: 1000,
        getCashBalance: function() {
            return this._balance;
        },
        setCashBalance: function(balance) {
            this._balance = balance;
        }
    };
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.withdraw(test_account_id, 80))
    .toBe("Amount dispensed: $80\nCurrent balance: 20.00");
    expect(accounts_dao.getAccountBalance(test_account_id)).toBe(20);
    expect(transactions_dao._transactions[0].account_id).toBe(test_account_id);
    expect(transactions_dao._transactions[0].amount).toBe(-80);
    expect(transactions_dao._transactions[0].balance).toBe(20);
    // TODO: add validation for timestamp
});

test('enough cash - overdraft', () => {
    let test_account_id = "test_account_id";
    let accounts_dao = {
        _balances: {
            test_account_id: 100
        },
        getAccountBalance: function(account_id) {
            return this._balances[account_id];
        },
        setAccountBalance: function(account_id, balance) {
            this._balances[account_id] = balance;
        }
    };
    let transactions_dao = {
        _transactions: [],
        addTransaction: function(account_id, timestamp, amount, new_balance) {
            this._transactions.push({account_id: account_id, timestamp: timestamp, amount: amount, balance: new_balance});
        }
    };
    let atm_state_dao = {
        _balance: 1000,
        getCashBalance: function() {
            return this._balance;
        },
        setCashBalance: function(balance) {
            this._balance = balance;
        }
    };
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.withdraw(test_account_id, 120))
    .toBe("Amount dispensed: $120\nYou have been charged an overdraft fee of $5. Current balance: -25.00");
    expect(accounts_dao.getAccountBalance(test_account_id)).toBe(-25);
    expect(transactions_dao._transactions[0].account_id).toBe(test_account_id);
    expect(transactions_dao._transactions[0].amount).toBe(-120);
    expect(transactions_dao._transactions[0].balance).toBe(-20);
    // TODO: add validation for timestamp
    expect(transactions_dao._transactions[1].account_id).toBe(test_account_id);
    expect(transactions_dao._transactions[1].amount).toBe(-5);
    expect(transactions_dao._transactions[1].balance).toBe(-25);
    // TODO: add validation for timestamp
});

test('not enough cash - withdrawal multiple of 20', () => {
    let test_account_id = "test_account_id";
    let accounts_dao = {
        _balances: {
            test_account_id: 100
        },
        getAccountBalance: function(account_id) {
            return this._balances[account_id];
        },
        setAccountBalance: function(account_id, balance) {
            this._balances[account_id] = balance;
        }
    };
    let transactions_dao = {
        _transactions: [],
        addTransaction: function(account_id, timestamp, amount, new_balance) {
            this._transactions.push({account_id: account_id, timestamp: timestamp, amount: amount, balance: new_balance});
        }
    };
    let atm_state_dao = {
        _balance: 40,
        getCashBalance: function() {
            return this._balance;
        },
        setCashBalance: function(balance) {
            this._balance = balance;
        }
    };
    let transaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);
    expect(transaction_executor.withdraw(test_account_id, 80))
    .toBe("Unable to dispense full amount requested at this time.Amount dispensed: $40\nCurrent balance: 60.00");
    expect(accounts_dao.getAccountBalance(test_account_id)).toBe(60);
    expect(transactions_dao._transactions[0].account_id).toBe(test_account_id);
    expect(transactions_dao._transactions[0].amount).toBe(-40);
    expect(transactions_dao._transactions[0].balance).toBe(60);
    // TODO: add validation for timestamp
});