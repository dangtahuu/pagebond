import express from "express";


import formidable from "express-formidable";
import { getPrompts, create } from "../controllers/prompt.js";


const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Prompt"});
});

router.route("/create").post(create);

router.route("/prompts").get(getPrompts)

export default router;
