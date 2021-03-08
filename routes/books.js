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
  res.render('books/all-books', {books: books, title: "All Books"});
}));

/* GET new books route */
router.get('/new', (req, res, next) => {
  res.render('books/new-book', {book: {}, title: "New Book"});  
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
      res.render('books/new-book', {book: book, errors: error.errors, title: "New Book"});
    }
  }
}));

/* GET single book page */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/show", { book: book, title: book.title }); 
  } else {
    res.sendStatus(404);

  }
}));

/* Update book form. */
router.get("/:id/update", asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book){
    res.render("books/update-book", { book: book, title: "Update Book" });
  } else {
    res.sendStatus(404);
  }
  
}));

/* Update a book. */
router.post('/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book){
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch(error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("books/update-book", {book: book, errors: error.errors, title: "Update Book"});
    } else {
      throw error;
    }
  }
}));

/* Delete article form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book){
    res.render("books/delete", { book: book, title: "Delete Book" });
  } else {
    res.sendStatus(404);
  }
  
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
  
}));

module.exports = router;
