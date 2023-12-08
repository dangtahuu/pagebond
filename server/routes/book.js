import express from "express";

import {
    deleteAll,
    editAll,
    getBook,
   searchBook,
   getSimilarBooks,
   getSimilarBooksForMultipleBooks,
   handleGoogle,
   getPopularGenres,
   fixGenres,
   getPopularBooks,
   getPopularBooksWithGenre
} from "../controllers/book.js";
import formidable from "express-formidable";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Book"});
});

router.route("/search-book").get(searchBook);
router.route("/get-book/:id").get(getBook);
router.route("/delete-book").delete(deleteAll);
router.route("/edit-book").put(editAll);
router.route("/get-similar-books/:id").get(getSimilarBooks);
router.route("/get-similar-books-multiple").get(getSimilarBooksForMultipleBooks);

router.route("/handle-google").post(handleGoogle);

router.route("/fix-genres").patch(fixGenres)

router.route("/get-popular-genres").get(getPopularGenres)
router.route("/popular-books").get(getPopularBooks)
router.route("/popular-books-with-genre").get(getPopularBooksWithGenre)



export default router;
