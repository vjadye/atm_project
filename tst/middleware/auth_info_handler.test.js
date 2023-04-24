const AuthInfoHandler = require('../../src/middleware/auth_info_handler');

test('authorization fails for no session cookie, no next is called', () => {
    let authorizer = {
    };

    let req = {
        cookies: {}
    };
    let res  = {
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    let nextCalled = false;
    let next = function() {
        nextCalled = true;
    }
    new AuthInfoHandler(authorizer).run(req, res, next);
    expect(res._status).toBe(401);
    expect(res._message).toBe("Authorization required");
    expect(nextCalled).toBe(false);
  });

  test('authorization fails for expired cookie, no next is called', () => {
    let test_session_cookie = "test-cookie";
    let authorizer = {
        verifyAuth: function(cookie) {
            if (cookie === test_session_cookie) {
                return {
                    status: 'FAILED',
                    reason: 'Expired'
                }
            }
        }
    };

    let req = {
        cookies: {
            "session_cookie": test_session_cookie
        }
    };
    let res  = {
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        }
    };
    let nextCalled = false;
    let next = function() {
        nextCalled = true;
    }
    new AuthInfoHandler(authorizer).run(req, res, next);
    expect(res._status).toBe(401);
    expect(res._message).toBe("Authorization required");
    expect(nextCalled).toBe(false);
  });

  test('authorization successful, next is called', () => {
    let test_session_cookie = "test-cookie";
    let test_account_id = "test_account_id";
    let authorizer = {
        verifyAuth: function(cookie) {
            if (cookie === test_session_cookie) {
                return {
                    status: 'OK',
                    account_id: test_account_id
                }
            }
        }
    };

    let req = {
        cookies: {
            "session_cookie": test_session_cookie
        }
    };
    let res  = {
        status: function(s) {
            this._status = s;
            return this;
        },
        send: function(m) {
            this._message = m;
        },
        locals: {

        }
    };
    let nextCalled = false;
    let next = function() {
        nextCalled = true;
    }
    new AuthInfoHandler(authorizer).run(req, res, next);
    expect(res.locals.account_id).toBe(test_account_id);
    expect(nextCalled).toBe(true);
  });