import express from "express";

import {
    createShelf,
    bookToShelf,
    getAllShelves,
    getSelectedShelves,
    getShelf,
    editShelf,
    deleteShelf,
    getTopShelvesOfBook,
    massAdd,
    addToShelfByName,
    removeFromShelf,
    getShelvesInBookPage,
    getShelfStatusOfBook,
    removeFromShelfByName,
    getFavorites,
    getUpNextPeople
} from "../controllers/shelf.js";
import formidable from "express-formidable";
import canUpdateOrDeleteShelf from "../middleware/canUpdateOrDeleteShelf.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Shelf"});
});

router.route("/create-shelf").post(createShelf);
router.route("/book-to-shelf").patch(bookToShelf);
router.route("/edit-shelf").patch(canUpdateOrDeleteShelf, editShelf);
router.route("/delete-shelf").post(canUpdateOrDeleteShelf, deleteShelf);

router.route("/add-by-name").patch(addToShelfByName);
router.route("/remove-by-name").patch(removeFromShelfByName);
router.route("/remove").patch(removeFromShelf);

router.route("/status/:bookId").get(getShelfStatusOfBook);

router.route("/favorites/:bookId").get(getFavorites);
router.route("/up-next-people/:bookId").get(getUpNextPeople);



router.route("/get-shelves/:userId").get(getAllShelves);
router.route("/get-shelves-in-book-page/:userId").get(getShelvesInBookPage);
router.route("/get-selected-shelves/:book").get(getSelectedShelves);
router.route("/get-top-shelves-of-book/:id").get(getTopShelvesOfBook);

router.route("/get-shelf/:shelfId").get(getShelf);
router.route("/massAdd").post(massAdd);




export default router;
