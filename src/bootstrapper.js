const SqliteAccountsDao = require('./dao/impl/sqlite_accounts_dao')
const SqliteAtmStateDao = require('./dao/impl/sqlite_atm_state_dao')
const SqliteTransactionsDao = require('./dao/impl/sqlite_transactions_dao')
const InMemorySessionsDao = require('./dao/impl/in_memory_sessions_dao')

const AuthInfoHandler = require('./middleware/auth_info_handler')
const AuthRequestHandler = require('./middleware/auth_req_handler')
const LogoutRequestHandler = require('./middleware/logout_req_handler')
const TransactionRequestHandler = require('./middleware/transaction_req_handler');

const Authorizer = require('./authorization/authorizer');
const TransactionsExecutor = require('./transactions/transactions_executor');

module.exports = {
    init : function() {
        // Configure app. For now using hardcoded configuration
        let accounts_dao = new SqliteAccountsDao();
        accounts_dao.initialize('./accounts.csv');
        let transactions_dao = new SqliteTransactionsDao();
        transactions_dao.initialize();

        let sessions_dao = new InMemorySessionsDao();
        let atm_state_dao = new SqliteAtmStateDao();
        atm_state_dao.initialize();

        let authorizer = new Authorizer(accounts_dao, sessions_dao);
        let trasaction_executor = new TransactionsExecutor(accounts_dao, transactions_dao, atm_state_dao);

        this.auth_info_handler = new AuthInfoHandler(authorizer);
        this.auth_req_handler = new AuthRequestHandler(authorizer);
        this.logout_request_handler = new LogoutRequestHandler(authorizer);
        this.transaction_request_handler = new TransactionRequestHandler(trasaction_executor);
    },
    auth_info_hook : function(req, res, next) {
        this.auth_info_handler.run(req, res, next);
    },

    auth_req_hook : function(req, res, next) {
        this.auth_req_handler.run(req, res, next);
    },

    transaction_req_hook : function(transaction_name, req, res, next) {
        this.transaction_request_handler.run(transaction_name, req, res, next);
    },

    logout_req_hook: function(req, res, next) {
        this.logout_request_handler.run(req, res, next);
    }
}