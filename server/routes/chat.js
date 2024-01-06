import express from "express";

import { deleteMessage, getAIRes, getAll, getAssistant, getUnread, markRead, sendMessage } from "../controllers/chat.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({ msg: "API chat" });
});

router.route("/all").get(getAll);
router.route("/unread").get(getUnread);

router.route("/send-message").put(sendMessage);
router.route("/get-ai-res").put(getAIRes);

router.route("/get-assistant").post(getAssistant);


router.route("/delete-message").patch(deleteMessage);
router.route("/mark-read/:id").patch(markRead);


export default router;
