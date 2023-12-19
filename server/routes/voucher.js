import express from "express";
import { redeem, create, getAllRemaining } from "../controllers/voucher.js";

import formidable from "express-formidable";
import canUpdateOrDeleteShelf from "../middleware/canUpdateOrDeleteShelf.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Voucher"});
});

router.route("/create").post(create);
router.route("/redeem").patch(redeem);
router.route("/all-remaining").get(getAllRemaining)


export default router;
