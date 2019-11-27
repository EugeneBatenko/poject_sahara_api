const express       = require('express');
const MongoClient   = require('mongodb').MongoClient;
const bodyParser    = require('body-parser');
const favicon       = require('serve-favicon');
const path          = require('path');
const app           = express();
const url_db        = 'mongodb+srv://Eugene:08081997GodServer@cluster0-rgrad.mongodb.net/test?retryWrites=true&w=majority';
let db;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(express.static('public'));
app.use(bodyParser.json());

MongoClient.connect(url_db,{ useUnifiedTopology: true }, (err, client) => {
  if (err) return console.log(err);
  db = client.db('quotes_db');// whatever your database name is
  app.listen(8080, () => {
    console.log('listening on 8080')
  })
});

app.get('/', (req, res) => {
  db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err);
    // renders index.ejs
    res.render('index.ejs', {quotes: result})
  })
});

app.post('/quotes', (req, res) => {
  db.collection('quotes').insertOne(req.body, (err, result) => {
    if (err) return console.log(err);
    console.log('saved to database');
    res.redirect('/');
  })
});