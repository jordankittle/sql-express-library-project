var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.redirect('/books');
});

//Test-error route
router.get('/test-error', (req, res, next) => {
  const error = new Error('Server Error');
  error.status = 500;
  return next(error);
});

module.exports = router;
