import express from "express";

import {
  create,
  getAll,
  getOne,
  edit,
  deleteOne,
  like,
  unlike,
  addComment,
  removeComment,
  getWithUser,
  getFollowing,
  getAllWithBook,
  getMy,
  getAdmin,
  getFromOfficial,
  report,
  dismissReport,
  getAllReported,
  verify,
  getAllPending,
  search,
  getFeatured
} from "../controllers/news.js";
import formidable from "express-formidable";
import { canUpdateOrDeleteNews } from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "News" });
});

router.route("/create").post(create);
router.route("/all").get(isAdmin, getAll);
router.route("/search").get(search);

// router.route("/create-adminpost").post(isAdmin, createAdminPost);
router.route("/all-reported").get(isAdmin, getAllReported);
router.route("/all-pending").get(isAdmin, getAllPending);


router.route("/following").get(getFollowing);
// router.route("/get-nearby/:long/:lat/:item").get(getNearby);
// router.route("/get-adminpost/").get(getAdminPosts);

//book
router.route("/book/:id").get(getAllWithBook);
router.route("/book-featured/:id").get(getFeatured);

// router.route("/book-exchanges/:id").get(getExchanges);
router.route("/book-my/:id").get(getMy);

// upload-image
// router.route("/upload-image").post(formidable(), uploadImage);

// like
router.route("/like").put(like);
router.route("/unlike").put(unlike);

// comment
router.route("/add-comment").put(addComment);
router.route("/remove-comment").put(removeComment);

// router.route("/total-reviews").get(totalReviews);

//admin
// router.route("/admin/delete-post/:id").delete(isAdmin, deletePost);

// get post with userID
router.route("/withUser/:userId").get(getWithUser);
router.route("/admin").get(getAdmin);
router.route("/official").get(getFromOfficial);

router.route("/report").patch(report);
router.route("/unreport").patch(isAdmin,dismissReport);
router.route("/verify").patch(isAdmin,verify);


router.route("/admin/delete/:id").delete(isAdmin, deleteOne);

router
  .route("/:id")
  .get(getOne)
  .patch(canUpdateOrDeleteNews, edit)
  .delete(canUpdateOrDeleteNews, deleteOne);

export default router;
