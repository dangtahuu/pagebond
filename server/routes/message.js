import express from "express";

import { getAllMessages, sendMassage } from "../controllers/message.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({ msg: "API message" });
});

router.route("/get-all-messages").get(getAllMessages);
router.route("/send-message").put(sendMassage);

export default router;
