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
  getOfficial
} from "../controllers/specialPost.js";
import formidable from "express-formidable";
import { canUpdateOrDeleteSpecialPost } from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "Special Post" });
});

router.route("/create").post(create);
router.route("/all").get(isAdmin, getAll);
// router.route("/create-adminpost").post(isAdmin, createAdminPost);

router.route("/following").get(getFollowing);
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
router.route("/remove-comment").put(removeComment);

// router.route("/total-reviews").get(totalReviews);

//admin
// router.route("/admin/delete-post/:id").delete(isAdmin, deletePost);

// get post with userID
router.route("/withUser/:userId").get(getWithUser);
router.route("/admin").get(getAdmin);
router.route("/official").get(getOfficial);



router
  .route("/:id")
  .get(getOne)
  .patch(canUpdateOrDeleteSpecialPost, edit)
  .delete(canUpdateOrDeleteSpecialPost, deleteOne);

export default router;
