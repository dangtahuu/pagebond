import express from "express";

import {getLogs, getNotifications, markAsUsed, markRead,markReadAll
} from "../controllers/log.js"
import formidable from "express-formidable";
import canUpdateOrDeleteShelf from "../middleware/canUpdateOrDeleteShelf.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Log"});
});

router.route("/noti").get(getNotifications);
router.route("/noti/mark-read").patch(markRead)
router.route("/noti/mark-read-all").patch(markReadAll)

router.route("/logs/:id").get(getLogs);
router.route("/logs/mark-used").patch(markAsUsed)


export default router;
