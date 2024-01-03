import express from "express";

import {
  create,
  edit,
  deleteOne,
  getAllWithBook,
  getAdmin,
  getFromOfficial,
  verify,
  getAllPending,
  getFeatured
} from "../controllers/news.js";
import formidable from "express-formidable";
import { canUpdateOrDeleteNews, canUpdateOrDeletePost } from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";
import { createPost, deletePost, editPost } from "../controllers/post.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "News" });
});

router.route("/create").post(create, createPost);

router.route("/all-pending").get(isAdmin, getAllPending);


//book
router.route("/book/:id").get(getAllWithBook);
router.route("/book-featured/:id").get(getFeatured);


// get post with userID
router.route("/admin").get(getAdmin);
router.route("/official").get(getFromOfficial);

router.route("/verify").patch(isAdmin,verify);

router.route("/admin/delete/:id").delete(isAdmin, deleteOne);

router
  .route("/:id")
  .patch(canUpdateOrDeletePost, editPost, edit)
  .delete(canUpdateOrDeletePost, deletePost, deleteOne);

export default router;
