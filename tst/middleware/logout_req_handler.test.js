const LogoutRequestHandler = require('../../src/middleware/logout_req_handler');

test('no session cookie, no problem', () => {
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
    new LogoutRequestHandler(authorizer).run(req, res);
    expect(res._status).toBe(200);
    expect(res._message).toBe("No account is currently authorized");
  });

  test('expired session cookie, no problem', () => {
    let test_session_cookie = "test-cookie";
    let authorizer = {
        logOut : function(cookie) {
            if (cookie === test_session_cookie) {
                return null;
            }
        }
    };

    let req = {
        cookies: {
            session_cookie: test_session_cookie
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
    new LogoutRequestHandler(authorizer).run(req, res);
    expect(res._status).toBe(200);
    expect(res._message).toBe("No account is currently authorized");
  });

  test('valid session cookie, message verification', () => {
    let test_session_cookie = "test-cookie";
    let test_account_id = "test-account-id";
    let authorizer = {
        logOut : function(cookie) {
            if (cookie === test_session_cookie) {
                return test_account_id;
            }
        }
    };

    let req = {
        cookies: {
            session_cookie: test_session_cookie
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
    new LogoutRequestHandler(authorizer).run(req, res);
    expect(res._status).toBe(200);
    expect(res._message).toBe(`Account ${test_account_id} logged out`);
  });