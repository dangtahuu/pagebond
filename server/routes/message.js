import express from "express";

import { deleteMessage, getAIRes, getAllMessages, getUnread, markRead, sendMessage } from "../controllers/message.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({ msg: "API message" });
});

router.route("/get-all-messages").get(getAllMessages);
router.route("/unread").get(getUnread);

router.route("/send-message").put(sendMessage);
router.route("/get-ai-res").put(getAIRes);

router.route("/delete-message").patch(deleteMessage);
router.route("/mark-read/:id").patch(markRead);


export default router;
