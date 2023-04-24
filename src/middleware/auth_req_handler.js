class AuthRequestHandler {
    constructor(authorizer) {
        this.authorizer = authorizer;
    }
    
    run(req, res, next){
        console.log(req.body)
        if(!req.body.account_id || !req.body.pin) {
            res.status(400).send('account_id and pin are required query parameters')
            return
        }

        console.log("auth req handler called")
        try {
            let auth_result = this.authorizer.authorize(req.body.account_id, req.body.pin);
            
            if (auth_result.status == 'OK') {
                console.log("Successfull authorization with session_id : " + auth_result.session_id);
                res.cookie('session_cookie', auth_result.session_id, { maxAge: 900000, httpOnly: true });
                res.status(200).send(`${req.body.account_id} successfully authorized.`);
                return;
            } else if (auth_result.status == 'FAILED') {
                console.log(`Authoraization failed for account_id ${req.body.account_id} due to ${auth_result.reason}` );
                res.status(401).send(`Authoraization failed due to ${auth_result.reason}`);
                return;
            }
            res.status(401).send("Authoraization failed for unknown reason");
        } catch (err) {
            console.log("Server fault: " + err);
            res.status(500).send("Internal server error occured");
        }
    }
}
module.exports = AuthRequestHandler;