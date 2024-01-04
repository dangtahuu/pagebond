import express from "express";

import {
  create,
  getAllWithBook,
  edit,
  deleteOne,
  getNearby,
  getDiscover,
} from "../controllers/trade.js";
import formidable from "express-formidable";
import { canUpdateOrDeletePost } from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";
import { createPost, deletePost, editPost } from "../controllers/post.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.json({ msg: "Trade" });
});

router.route("/create").post(create, createPost);

router.route("/discover").post(getDiscover);
router.route("/get-nearby/:long/:lat/").get(getNearby);

router.route("/book/:id").get(getAllWithBook);
router.route("/admin/delete/:id").delete(isAdmin, deleteOne);

router
  .route("/:id")
  .patch(canUpdateOrDeletePost, editPost, edit)
  .delete(canUpdateOrDeletePost, deleteOne, deletePost);

export default router;
