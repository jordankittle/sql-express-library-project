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

/* GET books page. */
router.get('/', asyncHandler(async (req, res, next) => {
  const books = await Book.findAll();
  res.json(books);
}));

/* GET new books route */
router.get('/new', (req, res, next) => {
  res.render('books/new-book', {title: "New Book"});  
});

/* POST new books route */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/' + book.id);
  } catch(error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('books/new', {book: book, errors: error.errors, title: "New Book"});
    }
  }
}));

module.exports = router;
