import express from "express";

import {
   searchBook
} from "../controllers/book.js";
import formidable from "express-formidable";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Book"});
});

router.route("/search-book").get(searchBook);

export default router;
