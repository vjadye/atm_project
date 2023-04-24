const express = require('express')
var cookieParser = require('cookie-parser')

const app_context = require('./bootstrapper')
const app = express()
const port = 3000

app.use(cookieParser());
app.use(express.json());

app_context.init();

app.get('/', function(req,res) {
  res.sendFile(__dirname + '/static/index.html');
});

app.get('/ping', (req, res) => {
  res.send('Healthy!')
})

app.post('/authorize', (req, res) => app_context.auth_req_hook(req, res))

app.post('/logout', (req, res) => app_context.logout_req_hook(req, res))

app.post('/withdraw', 
  (req, res, next) => app_context.auth_info_hook(req, res, next), 
  (req, res) => app_context.transaction_req_hook('withdraw',req, res))

app.post('/deposit', 
  (req, res, next) => app_context.auth_info_hook(req, res, next), 
  (req, res) => app_context.transaction_req_hook('deposit',req, res))

app.get('/balance', 
  (req, res, next) => app_context.auth_info_hook(req, res, next), 
  (req, res) => app_context.transaction_req_hook('balance',req, res))

app.get('/history', 
(req, res, next) => app_context.auth_info_hook(req, res, next), 
(req, res) => app_context.transaction_req_hook('history',req, res))

app.listen(port, () => {
  console.log(`atm server listening on port ${port}`)
})
