const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err);
    res.render('quotes.pug', {quotes: result})
  })
});

module.exports = router;
