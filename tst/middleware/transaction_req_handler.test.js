const TransactionRequestHandler = require('../../src/middleware/transaction_req_handler');

test('test balance', () => {
    let test_account_id = "testAccountId";
    let balance_result = "balance";
    let transaction_excutor = {
        balance: function(account_id) {
            if (test_account_id === account_id) {
                return balance_result;
            }
        }
    };

    let req = {
    };
    let res  = {
        locals: {
            account_id: test_account_id
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('balance', req, res);
    expect(res._status).toBe(200);
    expect(res._message).toBe(balance_result);
});

test('test balance - exception', () => {
    let transaction_excutor = {
        balance: function(account_id) {
            throw "error";
        }
    };

    let req = {
    };
    let res  = {
        locals: {
            account_id: 'testId'
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('balance', req, res);
    expect(res._status).toBe(500);
    expect(res._message).toBe("server failure to perform transaction");
});

test('test history', () => {
    let test_account_id = "testAccountId";
    let history_result = "history";
    let transaction_excutor = {
        history: function(account_id) {
            if (test_account_id === account_id) {
                return history_result;
            }
        }
    };

    let req = {
    };
    let res  = {
        locals: {
            account_id: test_account_id
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('history', req, res);
    expect(res._status).toBe(200);
    expect(res._message).toBe(history_result);
});

test('test history - exception', () => {
    let transaction_excutor = {
        history: function(account_id) {
            throw "error";
        }
    };

    let req = {
    };
    let res  = {
        locals: {
            account_id: 'testId'
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('history', req, res);
    expect(res._status).toBe(500);
    expect(res._message).toBe("server failure to perform transaction");
});

test('test withdraw - no input', () => {
    let test_account_id = "testAccountId";

    let req = {
        body : {

        }
    };
    let res  = {
        locals: {
            account_id: test_account_id
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler({}).run('withdraw', req, res);
    expect(res._status).toBe(400);
    expect(res._message).toBe('specify a withdrawal amount');
});

test('test withdraw', () => {
    let test_account_id = "testAccountId";

    let withdraw_message = "withdraw_message";
    let transaction_excutor = {
        withdraw: function(account_id, amount) {
            if (account_id === test_account_id && amount === 50) {
                return withdraw_message;
            }
        }
    };

    let req = {
        body : {
            amount: 50
        }
    };
    let res  = {
        locals: {
            account_id: test_account_id
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('withdraw', req, res);
    expect(res._status).toBe(200);
    expect(res._message).toBe(withdraw_message);
});

test('test withdraw - exception', () => {
    let transaction_excutor = {
        withdraw: function(account_id, amount) {
            throw "error";
        }
    };

    let req = {
        body : {
            amount: 50
        }
    };
    let res  = {
        locals: {
            account_id: 'testId'
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('withdraw', req, res);
    expect(res._status).toBe(500);
    expect(res._message).toBe("server failure to perform transaction");
});

test('test deposit - no input', () => {
    let test_account_id = "testAccountId";

    let req = {
        body : {

        }
    };
    let res  = {
        locals: {
            account_id: test_account_id
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler({}).run('deposit', req, res);
    expect(res._status).toBe(400);
    expect(res._message).toBe('specify a deposit amount');
});

test('test deposit', () => {
    let test_account_id = "testAccountId";

    let deposit_message = "deposit_message";
    let transaction_excutor = {
        deposit: function(account_id, amount) {
            if (account_id === test_account_id && amount === 50) {
                return deposit_message;
            }
        }
    };

    let req = {
        body : {
            amount: 50
        }
    };
    let res  = {
        locals: {
            account_id: test_account_id
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('deposit', req, res);
    expect(res._status).toBe(200);
    expect(res._message).toBe(deposit_message);
});

test('test deposit - exception', () => {
    let transaction_excutor = {
        deposit: function(account_id, amount) {
            throw "error";
        }
    };

    let req = {
        body : {
            amount: 50
        }
    };
    let res  = {
        locals: {
            account_id: 'testId'
        },
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    new TransactionRequestHandler(transaction_excutor).run('deposit', req, res);
    expect(res._status).toBe(500);
    expect(res._message).toBe("server failure to perform transaction");
});