import express from "express";

import {getLogs, getNotifications
} from "../controllers/log.js"
import formidable from "express-formidable";
import canUpdateOrDeleteShelf from "../middleware/canUpdateOrDeleteShelf.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Log"});
});

router.route("/noti").get(getNotifications);
router.route("/logs").get(getLogs);


export default router;