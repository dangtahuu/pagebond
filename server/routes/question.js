import express from "express";

import {
  create,
  edit,
  deleteOne,
  getAllWithBook,
} from "../controllers/question.js";
import formidable from "express-formidable";
import { canUpdateOrDeletePost } from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";
import { createPost, deletePost, editPost } from "../controllers/post.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "Question" });
});

router.route("/create").post(create, createPost);

//book
router.route("/book/:id").get(getAllWithBook);


router.route("/admin/delete/:id").delete(isAdmin, deleteOne);

router
  .route("/:id")
  .patch(canUpdateOrDeletePost, editPost, edit)
  .delete(canUpdateOrDeletePost, deletePost, deleteOne);

export default router;
