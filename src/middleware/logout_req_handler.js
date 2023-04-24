class LogoutRequestHandler {
    constructor(authorizer) {
        this.authorizer = authorizer;
    }
    
    run(req, res, next){
        var session_cookie = req.cookies['session_cookie'];
        if (session_cookie === undefined || session_cookie === null) {
            res.status(200).send("No account is currently authorized")
            return;
        }
        let logged_out_account = this.authorizer.logOut(session_cookie);
        if (logged_out_account === null) {
            res.status(200).send("No account is currently authorized")
            return;
        }
        console.log("assuming successfull logged out")
        res.status(200).send(`Account ${logged_out_account} logged out`)
    }
}
module.exports = LogoutRequestHandler;