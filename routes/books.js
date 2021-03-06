var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

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
  const message = req.query.message;
  const title = req.query.title;
  const id = req.query.id;
  const page = 1;
  const limit = 10;
  const offset = 0;
  const allBooks = await Book.findAll();
  const numberOfBooks = allBooks.length;
  const pages = Math.ceil(numberOfBooks / limit);
  const books = await Book.findAll({
    offset: offset,
    limit: 10
  });
  res.render('books/index', {books, page, pages, message, title, id, page_title: "All Books"});
}));

/*Get books pagination page */
router.get('/page/:page', asyncHandler(async (req, res, next) =>{
  const message = req.query.message;
  const title = req.query.title;
  const id = req.query.id;
  const page = parseInt(req.params.page);
  const limit = 10;
  const offset = limit * (page-1);
  const allBooks = await Book.findAll();
  const numberOfBooks = allBooks.length;
  const pages = Math.ceil(numberOfBooks / limit);
  const books = await Book.findAll({
    offset: offset,
    limit: 10,
  });
  res.render('books/index', {books, page, pages, message, title, id, page_title: "All Books"})
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
    res.redirect("/books" + `?title="${book.title}"&message=successfully added&id=${book.id}`);
  } catch(error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('books/new-book', {book: book, errors: error.errors, title: "New Book"});
    }
  }
}));

/* Search books with pagination */
router.get('/search/:page', asyncHandler(async (req, res, next) => {
  const query = req.query.query;
  const final_query = `%${query}%`;
  const page = parseInt(req.params.page);
  const limit = 10;
  const offset = limit * (page-1);
  const allBooks = await Book.findAll({
    where: {
      [Op.or]: [
        {
          title: {
            [Op.like]: final_query
          }
        },
        {
          author: {
            [Op.like]: final_query
          }
        },
        {
          genre: {
            [Op.like]: final_query
          }
        },
        {
          year: {
            [Op.like]: final_query
          }
        }
      ],
    }
  });
  const numberOfBooks = allBooks.length;
  const pages = Math.ceil(numberOfBooks / limit);
  console.log(numberOfBooks, pages);
  const books = await Book.findAll({
    offset: offset,
    limit:10,
    where: {
      [Op.or]: [
        {
          title: {
            [Op.like]: final_query
          }
        },
        {
          author: {
            [Op.like]: final_query
          }
        },
        {
          genre: {
            [Op.like]: final_query
          }
        },
        {
          year: {
            [Op.like]: final_query
          }
        }
      ],
    }  
  });
  console.log(books.length);
  const queryText = query.length > 0 ? `"${query}"` : 'all books'
  res.render('books/results', {books, page, pages, query, page_title: `Results for ${queryText}`} );
 
  
}));

/* Search books without pagination */
router.get('/search', asyncHandler(async (req, res, next) => {
  const query = req.query.query;
  const final_query = `%${query}%`;
  let book;
  try{
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: final_query
            }
          },
          {
            author: {
              [Op.like]: final_query
            }
          },
          {
            genre: {
              [Op.like]: final_query
            }
          },
          {
            year: {
              [Op.like]: final_query
            }
          }
        ],
      }
    });
    res.render('books/index', {books, page_title: "Results"} );
  } catch(error){
    next(error);
  }
  
}));

/* GET single book page */
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/update-book", { book: book, title: book.title }); 
  } else {
    const error = new Error("Page Not Found");
    error.status = 404;
    return next(error);
    //res.sendStatus(404);

  }
}));

/* Update a book. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book){
      await book.update(req.body);
      res.redirect("/books" + `?title="${book.title}"&message=successfully updated&id=${book.id}`);
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
router.get("/:id/delete", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book){
    res.render("books/delete", { book: book, title: "Delete Book" });
  } else {
    const error = new Error("Page Not Found");
    error.status = 404;
    return next(error);
    //res.sendStatus(404);
  }
  
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req ,res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books" + `?message="${book.title}" successfully deleted`);
  } else {
    res.sendStatus(404);
  }
  
}));

module.exports = router;
