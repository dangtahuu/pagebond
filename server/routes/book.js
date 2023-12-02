import express from "express";

import {
    getBook,
   searchBook
} from "../controllers/book.js";
import formidable from "express-formidable";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Book"});
});

router.route("/search-book").get(searchBook);
router.route("/get-book/:id").get(getBook);


export default router;
