class TransactionRequestHandler {
    constructor(transaction_excutor) {
        this.transaction_excutor = transaction_excutor;
    }
    
    run(command, req, res){
        // TODO: Verify that the session cookie header is included
        // TODO: Use authorizer to verify if the session cookie is active valid cookie

        let account_id = res.locals.account_id;
        console.log(`transaction request called for ${account_id}`)

        try {
            let result = undefined;
            switch (command) {
                case 'balance':
                    result = this.transaction_excutor.balance(account_id);
                    break;
                case 'withdraw':
                    if(!req.body.amount) {
                        res.status(400).send('specify a withdrawal amount')
                        return
                    }
                    result = this.transaction_excutor.withdraw(account_id, req.body.amount);
                    break;
                case 'deposit':
                    if(!req.body.amount) {
                        res.status(400).send('specify a deposit amount')
                        return
                    }
                    result = this.transaction_excutor.deposit(account_id, req.body.amount);
                    break;
                case 'history':
                    result = this.transaction_excutor.history(account_id);
                    break;
            }
            res.status(200).send(result.toString());
        } catch (err) {
            console.log("unexpected error: " + err);
            res.status(500).send('server failure to perform transaction');
        }
    }
}
module.exports = TransactionRequestHandler;