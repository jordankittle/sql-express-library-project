var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');

var app = express();

//import sequelize and test connection
var sequelize = require('./models').sequelize;
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    console.log('Sequelize synced with database.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);

// 404 Handler
app.use(function(req, res, next) {
  const error = new Error(`Page not ${req.originalUrl} not found`);
  error.status = 404;
  console.log('404 Error handler: ', error.status, error.message);
  res.status(404).render('page-not-found', {error, title: "Page Not Found"});
});

// Global error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log('Error', err.status, err.message);
  if (err.status === 404) {
    res.status(404).render('page-not-found', { err, title: "Page Not Found" });
  } else {
    err.messasge = err.message || 'Server error';
    res.status(err.status || 500).render('error', { err, title: "Server Error" });

  }
});

module.exports = app;
