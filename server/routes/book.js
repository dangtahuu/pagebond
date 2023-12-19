import express from "express";

import {
    deleteAll,
    editAll,
    getBook,
    getBookBySameAuthor,
   searchBook,
   getSimilarBooks,
   getSimilarBooksForMultipleBooks,
   handleGoogle,
   getPopularGenres,
   fixGenres,
   getPopularBooks,
   getPromptsForBook,
} from "../controllers/book.js";
import formidable from "express-formidable";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Book"});
});

router.route("/search").get(searchBook);
router.route("/get-book/:id").get(getBook);
router.route("/get-book-prompts/:id").get(getPromptsForBook);

router.route("/get-book-author/:id").get(getBookBySameAuthor);

router.route("/delete-book").delete(deleteAll);
router.route("/edit-book").put(editAll);
router.route("/get-similar-books/:id").get(getSimilarBooks);
router.route("/get-similar-books-multiple").get(getSimilarBooksForMultipleBooks);

router.route("/handle-google").post(handleGoogle);

router.route("/fix-genres").patch(fixGenres)

router.route("/get-popular-genres").get(getPopularGenres)
router.route("/popular-books").get(getPopularBooks)



export default router;
