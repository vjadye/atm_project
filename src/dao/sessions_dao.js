class SessionsDao {
    constructor() {
        if(!this.getSessionData) {
            throw new Error("SessionsDao must implement getSessionData");
        }
        if(!this.setSessionData) {
            throw new Error("SessionsDao must implement setSessionData");
        }
    }
}
module.exports = SessionsDao;