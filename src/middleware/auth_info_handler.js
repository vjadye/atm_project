class AuthInfoHandler {
    constructor(authorizer) {
        this.authorizer = authorizer;
    }
    
    run(req, res, next){
        // TODO: Verify that the session cookie header is included
        // TODO: Use authorizer to verify if the session cookie is active valid cookie
        console.log("auth info handler called : request body : " + JSON.stringify(req.body));
    
        var session_cookie = req.cookies['session_cookie'];
        if (session_cookie === undefined || session_cookie === null) {
            res.status(401).send("Authorization required")
            return; // don't proceed to next.
        }

        let auth_status = this.authorizer.verifyAuth(session_cookie);
        if (auth_status.status !== 'OK') {
            console.log(`invalid session ${session_cookie} due to ${auth_status.reason}`);
            res.status(401).send("Authorization required");
            return; // don't proceed to next
        }

        res.locals.account_id = auth_status.account_id;
        next()
    }
}
module.exports = AuthInfoHandler;