const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuotesScheme = new Schema(
   {
      name: String,
      quote: String
   });

const Quotes = mongoose.model('Quotes', QuotesScheme);

module.exports = Quotes
