const AuthRequestHandler = require('../../src/middleware/auth_req_handler');

test('authorization fails when no account or pin', () => {
    let authorizer = {
    };

    let req = {
        body: {
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
    new AuthRequestHandler(authorizer).run(req, res);
    expect(res._status).toBe(400);
    expect(res._message).toBe('account_id and pin are required query parameters');
  });

  test('authorization fails when invalid account or pin', () => {
    let reason = "Unknown account or invalid pin";
    let authorizer = {
        authorize: function(account, pin) {
            return {
                status: "FAILED",
                reason: reason
            }
        }
    };

    let req = {
        body: {
            account_id: "test",
            pin: "test-pin"
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
    new AuthRequestHandler(authorizer).run(req, res);
    expect(res._status).toBe(401);
    expect(res._message).toBe(`Authoraization failed due to ${reason}`);
  });

  test('authorization successful', () => {
    let session_id = "test-session-id";
    let authorizer = {
        authorize: function(account, pin) {
            return {
                status: "OK",
                session_id: session_id
            }
        }
    };

    let req = {
        body: {
            account_id: "test-account",
            pin: "test-pin"
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
        cookie: function(name, value, options) {
            this._cookie_name = name;
            this._cookie_value = value;
            this._cookie_options = options;
        }
    };
    new AuthRequestHandler(authorizer).run(req, res);
    expect(res._status).toBe(200);
    expect(res._cookie_name).toBe("session_cookie");
    expect(res._cookie_value).toBe(session_id);
    expect(res._message).toBe('test-account successfully authorized.');

    //TODO: Add additional verification for cookie age and access control.
  });

  