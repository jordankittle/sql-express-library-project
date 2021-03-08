var express = require('express');
var router = express.Router();

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
  res.render('books/new', {title: "New Book"});  
});

module.exports = router;
