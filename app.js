const createError = require('http-errors');
const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Quotes = require('./schema/index')

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
   cors: {
      origin: '*',
   }
});

//Database
dotenv.config({
   path: './config/.env',
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(cors())
app.use(sassMiddleware({
   src: path.join(__dirname, 'public'),
   dest: path.join(__dirname, 'public'),
   indentedSyntax: false, // true = .sass and false = .scss
   sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const changeStream = Quotes.watch();

// Requests
const getAndSendData = () => {
   Quotes.find()
      .then(results => {
         io.emit("getAllQuotes", results);
      })
      .catch(error => console.error(error))
}

const getOneItem = (socket) => {
   socket.on("sendItemId", (itemId) => {
      Quotes.findById(itemId)
         .then(results => {
            io.emit("getOneItem", results);
         })
         .catch(error => console.error(error))
   })
}

const sendData = (socket) => {
   socket.on("change getFormData", (name, quote) => {
      const quotes = new Quotes({name: name, quote: quote})
      quotes.save((err, result) => {
         if (err) return console.log(err);
         console.log('saved to database');
      });
   });
}

const deleteItem = (socket) => {
   socket.on("change deleteItem", (id) => {
      Quotes.findOneAndDelete({ _id: id }).then(results => {
         console.log(results);
      }).catch(error => console.error(error))
      console.log(id + 'deleted');
   })
}

const updateItem = (socket) => {
   socket.on("change getFormDataAndUpdate", (id, name, quote) => {

      Quotes.findByIdAndUpdate(id, {name: name, quote: quote}, (err, result) => {
         if (err) return console.log(err);
         console.log(id + 'is updated');
      })
   })
}

// Listen changes in DB
changeStream.on('change', (change) => {
   console.log(change);
   getAndSendData()
});

// Socket connection
io.on('connection', (socket) => {
   console.log('IO connected');
   getAndSendData()
   getOneItem(socket)
   sendData(socket)
   deleteItem(socket)
   updateItem(socket)

   socket.on('disconnect', () => {
      console.log('IO disconnected');
   });
});

mongoose.connect(`${process.env.URL}`, {
   useUnifiedTopology: true,
   useNewUrlParser: true,
   useCreateIndex: true
}).then(() => {
   console.log("Successfully connected to the database");
}).catch(err => {
   console.log('Could not connect to the database. Exiting now...', err);
   process.exit();
});


//Routes
const indexRouter = require('./routes/index');
const quotesRouter = require('./routes/quotes');

app.use('/', indexRouter);
app.use('/quotes', quotesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
   next(createError(404));
});


// Listen port
http.listen(4000, () => {
   console.log('listening on 4000');
});

module.exports = app;
