import express from "express";

import {
  create,
  getAll,
  getOne,
  getAllWithBook,
  getMy,
  edit,
  deleteOne,
  like,
  unlike,
  addComment,
  removeComment,
  getWithUser,
  getFollowing,
  getDiscover,
  addCommentAI,
  report,
  dismissReport,
  getAllReported
} from "../controllers/question.js";
import formidable from "express-formidable";
import { canUpdateOrDeleteQuestion } from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "Question" });
});

router.route("/create").post(create);
router.route("/all").get(isAdmin, getAll);
router.route("/all-reported").get(isAdmin, getAllReported);

// router.route("/create-adminpost").post(isAdmin, createAdminPost);

router.route("/following").get(getFollowing);
router.route("/discover").post(getDiscover);
// router.route("/get-nearby/:long/:lat/").get(getNearby);

// router.route("/get-nearby/:long/:lat/:item").get(getNearby);
// router.route("/get-adminpost/").get(getAdminPosts);

//book
router.route("/book/:id").get(getAllWithBook);
// router.route("/book-exchanges/:id").get(getExchanges);
router.route("/book-my/:id").get(getMy);

// upload-image
// router.route("/upload-image").post(formidable(), uploadImage);

// like
router.route("/like").put(like);
router.route("/unlike").put(unlike);

// comment
router.route("/add-comment").put(addComment);
router.route("/add-comment-ai").put(addCommentAI);

router.route("/remove-comment").put(removeComment);

// router.route("/total-reviews").get(totalReviews);

//admin
// router.route("/admin/delete-post/:id").delete(isAdmin, deletePost);
router.route("/report").patch(report);
router.route("/unreport").patch(isAdmin,dismissReport);
// get post with userID
router.route("/withUser/:userId").get(getWithUser);

router.route("/admin/delete/:id").delete(isAdmin, deleteOne);

router
  .route("/:id")
  .get(getOne)
  .patch(canUpdateOrDeleteQuestion, edit)
  .delete(canUpdateOrDeleteQuestion, deleteOne);

export default router;
