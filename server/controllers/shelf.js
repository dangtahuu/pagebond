import Shelf from "../models/shelf.js";
import User from "../models/user.js";
import Book from "../models/book.js";

const createShelf = async (req, res) => {
  const { name } = req.body;

  if (!name.length) {
    return res.status(400).json({ msg: "Name is required!" });
  }

  try {
    const exist = await Shelf.find({
      $and: [{ owner: req.user.userId }, { name: name }],
    });
    console.log(exist);
    if (exist.length) {
      return res
        .status(400)
        .json({ msg: "A shelf with this name already existed!" });
    }
    const shelf = await Shelf.create({
      name,
      owner: req.user.userId,
    });

    return res.status(200).json({ msg: "New shelf created!", shelf: shelf });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const bookToShelf = async (req, res) => {
  const { book, selected, nonSelected } = req.body;

  if (!book || (!selected && !nonSelected)) {
    return res.status(400).json({ msg: "Book and shelves are required!" });
  }


  try {
    if (selected) {
      selected.forEach(async (item) => {
        const selectedShelf = await Shelf.findByIdAndUpdate(item, {
          $addToSet: {
            books: book.id,
          },
        });
      });
    }

    if (nonSelected) {
      nonSelected.forEach(async (item) => {
        const selectedShelf = await Shelf.findByIdAndUpdate(item, {
          $pull: {
            books: book.id,
          },
        });
      });
    }

    const shelves = await Shelf.find({
      $and: [
        { books: { $in: [book.id] } },
        { type: 1 },
        { name: { $ne: "to read" } },
        { name: { $ne: "favorites" } }
      ]
    });

    const shelfNameCount = {};

    shelves.forEach((shelf) => {
      shelfNameCount[shelf.name] = (shelfNameCount[shelf.name] || 0) + 1;
    });

    const sortedShelfNames = Object.keys(shelfNameCount).sort(
      (a, b) => shelfNameCount[b] - shelfNameCount[a]
    );

    const newBook = await Book.findByIdAndUpdate(book.id,{
      topShelves: sortedShelfNames.slice(0,5)
    }) 

    return res.status(200).json({ selected });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};


const addToTBR = async (req, res) => {
  const { id } = req.body;
  const { userId } = req.user;

  if (!id) {
    return res.status(400).json({ msg: "Book Id is required!" });
  }

  try {
        const shelf = await Shelf.findOneAndUpdate({$and: [{name: "to read"},{owner: userId}]}, {
          $addToSet: {
            books: id,
          },
        });
    return res.status(200).json({ shelf });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const removeFromTBR = async (req, res) => {
  const { id } = req.body;
  const { userId } = req.user;

  if (!id) {
    return res.status(400).json({ msg: "Book Id is required!" });
  }

  try {
        const shelf = await Shelf.findOneAndUpdate({$and: [{name: "to read"},{owner: userId}]}, {
          $pull: {
            books: id,
          },
        });
    return res.status(200).json({ shelf });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getShelves = async (req, res) => {
  try {
    const userId = req.params.userId;
    const shelves = await Shelf.find({ owner: userId });
    return res.status(200).json({ shelves });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getSelectedShelves = async (req, res) => {
  const book = req.params.book;

  try {
    const shelves = await Shelf.find({
      $and: [{ owner: req.user.userId }, { books: { $in: [book] } }],
    });
    const ids = shelves.map((x) => x._id);
    const names = shelves.map((x) => x.name);

    return res.status(200).json({ ids, names });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getShelf = async (req, res) => {
  const { shelfId } = req.params;
  try {
    const shelf = await Shelf.findById(shelfId)
      .populate("books")
      .sort({ createdAt: -1 });
    return res.status(200).json({ shelf });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const editShelf = async (req, res) => {
  const { shelfId, name } = req.body;
  try {
    const shelf = await Shelf.findByIdAndUpdate(shelfId, { name });
    return res.status(200).json({ shelf, msg: "Shelf renamed" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const deleteShelf = async (req, res) => {
  const { shelfId } = req.body;
  try {
    const shelf = await Shelf.findByIdAndDelete(shelfId);
    return res.status(200).json({ shelf, msg: "Shelf deleted" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getTopShelvesOfBook = async (req, res) => {
  const { id } = req.params;
  try {
    const shelves = await Shelf.find({
      books: { $in: [id] }, 
    });

    const shelfNameCount = {};

    shelves.forEach((shelf) => {
      shelfNameCount[shelf.name] = (shelfNameCount[shelf.name] || 0) + 1;
    });

    const sortedShelfNames = Object.keys(shelfNameCount).sort(
      (a, b) => shelfNameCount[b] - shelfNameCount[a]
    );

    return res.status(200).json({ names: sortedShelfNames.slice(0, 1) });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const massAdd = async (req, res) => {
  const listShelf = [
    "to read",
    "informative",
    "lighthearted",
    "challenging",
    "emotional",
    "funny",
    "sad",
    "inspiring",
    "mind-boggling",
    "adventurous",
    "introspective",
    "charming",
    "nostalgic",
    "euphoric",
    "dark",
  ];
  try {
    const users = await User.find({});
    for (const user of users) {
      // console.log(user)
      for (const shelf of listShelf) {
        const newShelf = await Shelf.create({
          name: shelf,
          owner: user._id,
        });
      }
    }

    return res.status(200).json({ msg: "New shelf created!" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

export {
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
  removeFromTBR,
};
