import express from "express";

import formidable from "express-formidable";
import isAdmin from "../middleware/isAdmin.js";
import { search } from "../controllers/hashtag.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Hashtag"});
});

router.route("/search").get(search);





export default router;
