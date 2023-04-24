const Authorizer = require('../../src/authorization/authorizer');

test('authorization fails for invalid account', () => {
  let accounts_dao = {
    getAccountPin: function(account_id) {
        return null;
    }
  };
  let authorizer = new Authorizer(accounts_dao, {});
  expect(authorizer.authorize(12345, 2231)).toStrictEqual({
    status: "FAILED",
    "reason": "ACCOUNT NOT FOUND"
  });
});

test('authorization fails for valid account with invalid pin', () => {
    let invalid_pin = 2345;
    let accounts_dao = {
        getAccountPin: function(account_id) {
            return invalid_pin;
        }
    };
    let authorizer = new Authorizer(accounts_dao, {});
    expect(authorizer.authorize(12345, 2231)).toStrictEqual({
        status: "FAILED",
        "reason": "INCORRECT PIN"
    });
});

test('authorizes valid account with valid pin', () => {
    let valid_pin = 2345;
    let test_acount_id = 12345;
    let accounts_dao = {
        getAccountPin: function(account_id) {
            return valid_pin;
        }
    };
    var stored_sessions = {};
    var stored_sessions_ttl = {};
    let sessions_dao = {
        setSessionData: function(session_id, data, ttl) {
            stored_sessions[session_id] = data;
            stored_sessions_ttl[session_id] = ttl;
        }
    }
    let nowInMs = new Date();
    nowInMs.setMinutes(nowInMs.getMinutes() + 2)
    let expectedMinTtl = nowInMs.getTime();
    let authorizer = new Authorizer(accounts_dao, sessions_dao);
    let auth_status = authorizer.authorize(test_acount_id, valid_pin);
    expect(auth_status.status).toBe('OK');
    expect(stored_sessions[auth_status.session_id]).toStrictEqual(
        {
            status: 'authorized',
            account_id: test_acount_id
        });
    expect(stored_sessions_ttl[auth_status.session_id] >= expectedMinTtl).toBe(true);
});

test('authorizes valid account with sessions_dao exception', () => {
    let valid_pin = 2345;
    let accounts_dao = {
        getAccountPin: function(account_id) {
            return valid_pin;
        }
    };
    var stored_sessions = {};
    var stored_sessions_ttl = {};
    let sessions_dao = {
        setSessionData: function(session_id, data, ttl) {
            throw new Error("sessions storage failure");
        }
    }
    let authorizer = new Authorizer(accounts_dao, sessions_dao);
    expect(() => authorizer.authorize(12345, valid_pin)).toThrow("authorization failed due to - Error: sessions storage failure");
});

test('verify auth for an unknwon session', () => {
    let sessions_dao = {
        getSessionData: function(session_id) {
            return null;
        }
    }
    let authorizer = new Authorizer({}, sessions_dao);

    let test_sssion_id = "session123";
    expect(authorizer.verifyAuth(test_sssion_id)).toStrictEqual(
        {status: "INVALID", reason: "Unauthorized"});
});

test('verify auth for an expired session', () => {
    let sessions_dao = {
        getSessionData: function(session_id) {
            return {
                status: 'expired', 
                account_id: {}
            };
        }
    }
    let authorizer = new Authorizer({}, sessions_dao);

    let test_session_id = "session123";
    expect(authorizer.verifyAuth(test_session_id)).toStrictEqual(
        {status: "INVALID", reason: "Session timed out"});
});

test('verify auth for a valid session', () => {
    let test_account_id = "accountId1";
    var stored_sessions = {};
    var stored_sessions_ttl = {};
    let sessions_dao = {
        getSessionData: function(session_id) {
            return {
                status: 'authorized', 
                account_id: test_account_id
            };
        },
        setSessionData: function(session_id, data, ttl) {
            stored_sessions[session_id] = data;
            stored_sessions_ttl[session_id] = ttl;
        }
    }
    let authorizer = new Authorizer({}, sessions_dao);

    let nowInMs = new Date();
    nowInMs.setMinutes(nowInMs.getMinutes() + 2)
    let expectedMinTtl = nowInMs.getTime();

    let test_session_id = "session123";
    expect(authorizer.verifyAuth(test_session_id)).toStrictEqual(
        {status: "OK", account_id: test_account_id});
    
    expect(stored_sessions[test_session_id]).toStrictEqual({
        status: 'authorized',
        account_id: test_account_id
    });
    expect(stored_sessions_ttl[test_session_id] >= expectedMinTtl).toBe(true);
});

test('logout invalidates the session', () => {
    let test_sssion_id = "session12";
    let test_account_id = "testAccountId";
    var stored_sessions = {
        session12: {
            status: 'authorized',
            account_id: test_account_id
        }
    };
    var stored_sessions_ttl = {};
    let sessions_dao = {
        setSessionData: function(session_id, data, ttl) {
            stored_sessions[session_id] = data;
            stored_sessions_ttl[session_id] = ttl;
        },
        getSessionData: function(session_id) {
            return stored_sessions[session_id];
        }
    }
    let authorizer = new Authorizer({}, sessions_dao);

    
    authorizer.logOut(test_sssion_id);
    expect(stored_sessions[test_sssion_id]).toStrictEqual(
        {
            status: 'expired', 
            account_id: test_account_id
        });
    expect(stored_sessions_ttl[test_sssion_id]).toBe(0);
});
