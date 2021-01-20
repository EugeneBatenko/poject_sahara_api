const express = require('express');
const router = express.Router();
const Quotes = require('../schema/index')

router.get('/', (req, res) => {
   Quotes.find()
      .then(results => {
         console.log(results);
         res.render('quotes.pug', {quotes: results})
      }).catch(error => console.error(error))
});

router.post('/', (req, res) => {
   const quotes = new Quotes(req.body);
   quotes.save((err, result) => {
      if (err) return console.log(err);
      console.log('saved to database');
      res.redirect('/quotes');
   });
})

router.delete('/delete/:id', (req, res) => {
   Quotes.findOneAndDelete({ _id: req.params.id }).then(results => {
      console.log(results);
      res.redirect('/quotes');
   }).catch(error => console.error(error))
});


module.exports = router;
