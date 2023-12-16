import express from "express";

import {
    createShelf,
    bookToShelf,
    getShelves,
    getSelectedShelves,
    getShelf,
    editShelf,
    deleteShelf,
    getTopShelvesOfBook,
    massAdd,
    addToTBR,
    removeFromTBR
} from "../controllers/shelf.js";
import formidable from "express-formidable";
import canUpdateOrDeleteShelf from "../middleware/canUpdateOrDeleteShelf.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Shelf"});
});

router.route("/create-shelf").post(createShelf);
router.route("/book-to-shelf").post(bookToShelf);
router.route("/edit-shelf").post(canUpdateOrDeleteShelf, editShelf);
router.route("/delete-shelf").post(canUpdateOrDeleteShelf, deleteShelf);

router.route("/add-tbr").patch(addToTBR);
router.route("/remove-tbr").patch(removeFromTBR);


router.route("/get-shelves/:userId").get(getShelves);
router.route("/get-selected-shelves/:book").get(getSelectedShelves);
router.route("/get-top-shelves-of-book/:id").get(getTopShelvesOfBook);

router.route("/get-shelf/:shelfId").get(getShelf);
router.route("/massAdd").post(massAdd);




export default router;
