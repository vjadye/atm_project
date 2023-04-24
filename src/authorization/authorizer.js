const uuid = require('uuid');

class Authorizer {
    constructor(accounts_dao, sessions_dao) {
        this.accounts_dao = accounts_dao
        this.sessions_dao = sessions_dao
    }
    authorize(account_id, pin) {
        console.log(`authorizing account_id: ${account_id}`);

        try {
            let found_pin = this.accounts_dao.getAccountPin(account_id);
            if (found_pin === null || found_pin === undefined) {
                return {
                    status: "FAILED",
                    reason: "ACCOUNT NOT FOUND"
                };
            }
            if (pin.toString().trim() === found_pin.toString().trim()) {
                // generate a session id and store before returning.
                let session_id = uuid.v4();
                console.log(`generating new session id: ${session_id}`);
                this._handleAuthorizedSession(session_id, account_id);

                return {
                    status: "OK",
                    session_id: session_id
                };
            }
            return {
                status: "FAILED",
                reason: "INCORRECT PIN"
            };
        } catch (error) {
            // no retries for now. Fail this authentication request.
            throw "authorization failed due to - " + error;
        }
    }

    verifyAuth(session_id) {
        console.log(`verifying session_cookie: ${session_id}`);

        let session_data = this.sessions_dao.getSessionData(session_id);
        if (session_data === null || session_data === undefined) {
            return { status: 'INVALID', reason : 'Unauthorized' };
        }

        if (session_data.status === 'expired') {
            return { status: 'INVALID', reason : 'Session timed out' };
        }

        // session is valid, extend the lifespan by 2 minutes
        this._handleAuthorizedSession(session_id, session_data.account_id);
        return { status: 'OK', account_id: session_data.account_id};
    }

    logOut(session_id) {
        console.log(`logging out session_cookie: ${session_id}`);
        
        let session_data = this.sessions_dao.getSessionData(session_id);
        if (session_data === null || session_data === undefined || session_data.status === 'expired') {
            console.log("invalid session, nothing to do");
            return null;
        }

        let logged_out_account = session_data.status === 'authorized' ? session_data.account_id : null;
        session_data.status = 'expired';
        this.sessions_dao.setSessionData(session_id, session_data, 0);
        return logged_out_account;
    }

    _handleAuthorizedSession(session_id, account_id) {
        let dt = new Date();
        dt.setMinutes(dt.getMinutes() + 2);
        this.sessions_dao.setSessionData(session_id, 
            { 
                status: "authorized",
                account_id: account_id 
            }, dt.getTime());
    }
}

module.exports = Authorizer