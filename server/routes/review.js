import express from "express";

import{
  create,
  getAllWithBook,
  edit,
  deleteOne,
  getDiscover,
  getDiary,
  getRecent,
  calculateRatingChart,
  getNumberOfBooksOfUser,
  getUserYearStats
} from "../controllers/review.js";
import formidable from "express-formidable";
import {canUpdateOrDeletePost, canUpdateOrDeleteReview} from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";
import { createPost, deletePost, editPost } from "../controllers/post.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "Review" });
});

router.route("/create").post(create, createPost);

router.route("/discover").post(getDiscover);

router.route("/book/:id").get(getAllWithBook);
router.route("/book-chart/:id").get(calculateRatingChart);


router.route("/diary/:userId").get(getDiary);
router.route("/number-of-books/:userId").get(getNumberOfBooksOfUser);
router.route("/year-stats/:userId/:year").get(getUserYearStats);


router.route("/recent/:userId").get(getRecent);


router.route("/admin/delete/:id").delete(isAdmin, deleteOne);

router
  .route("/:id")
  .patch(canUpdateOrDeletePost, editPost, edit)
  .delete(canUpdateOrDeletePost, deletePost, deleteOne);

export default router;
