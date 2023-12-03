import express from "express";

import {
  createReview,
  allReviews,
  getReview,
  getReviews,
  getMyReviews,
  editReview,
  deleteReview,
  likeReview,
  unlikeReview,
  addCommentToReview,
  removeCommentfromReview,
  totalReviews,
  getReviewsWithUserId,
  getFollowingReviews,
} from "../controllers/review.js";
import formidable from "express-formidable";
import {canUpdateOrDeleteReview} from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "Review" });
});

router.route("/create-review").post(createReview);
router.route("/all-reviews").get(isAdmin, allReviews);
// router.route("/create-adminpost").post(isAdmin, createAdminPost);

router.route("/following-reviews/").get(getFollowingReviews);
// router.route("/get-nearby/:long/:lat/:item").get(getNearby);
// router.route("/get-adminpost/").get(getAdminPosts);

//book
router.route("/book-reviews/:id").get(getReviews);
// router.route("/book-exchanges/:id").get(getExchanges);
router.route("/book-myReviews/:id").get(getMyReviews);

// upload-image
// router.route("/upload-image").post(formidable(), uploadImage);

// like
router.route("/like").put(likeReview);
router.route("/unlike").put(unlikeReview);

// comment
router.route("/add-comment").put(addCommentToReview);
router.route("/remove-comment").put(removeCommentfromReview);

router.route("/total-reviews").get(totalReviews);

//admin
// router.route("/admin/delete-post/:id").delete(isAdmin, deletePost);

// get post with userID
router.route("/getReviewsWithUser/:userId").get(getReviewsWithUserId);

router
  .route("/:id")
  .get(getReview)
  .patch(canUpdateOrDeleteReview, editReview)
  .delete(canUpdateOrDeleteReview, deleteReview);

export default router;
