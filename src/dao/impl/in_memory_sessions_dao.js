const SessionsDao = require("../sessions_dao");

const SESSION_REFRESH_TIME = 30000;
class InMemorySessionsDao extends SessionsDao {
    constructor() {
        super();
        this.session_map = {};
        setTimeout(this.cleanupOldSession.bind(this), SESSION_REFRESH_TIME);
    }
    getSessionData(session_id) {
        let session_data = this.session_map[session_id];
        if (session_data === null || session_data === undefined) {
            return null;
        }

        if (this.isExpiredSession(session_data)) {
            return null;
        }
        return session_data.data;
    }
    setSessionData(session_id, data, ttl) {
        this.session_map[session_id] = {
            data: data,
            ttl: ttl
        }
    }

    cleanupOldSession() {
        console.log("cleaning up old sessions");
        for (const session_id in this.session_map) {
            // TODO: This feels like a leak of abstraction, need to fix
            let status = this.session_map[session_id].data.status;
            if (status !== 'authorized' || this.isExpiredSession(this.session_map[session_id])) {
                console.log(`Removing session : ${session_id}`);
                delete this.session_map[session_id]
            }
        }
        setTimeout(this.cleanupOldSession.bind(this), SESSION_REFRESH_TIME);
    }

    isExpiredSession(session_data) {
        return session_data.ttl < new Date().getTime();
    }
}
module.exports = InMemorySessionsDao;