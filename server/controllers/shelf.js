import Shelf from "../models/shelf.js";
import User from "../models/user.js";
import Book from "../models/book.js";
import Review from "../models/review.js";
import mongoose from "mongoose";
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
      $and: [{ books: { $in: [book.id] } }, { type: { $ne: 1 } }],
    });

    const shelfNameCount = {};

    shelves.forEach((shelf) => {
      shelfNameCount[shelf.name] = (shelfNameCount[shelf.name] || 0) + 1;
    });

    const sortedShelfNames = Object.keys(shelfNameCount).sort(
      (a, b) => shelfNameCount[b] - shelfNameCount[a]
    );

    const newBook = await Book.findByIdAndUpdate(book.id, {
      topShelves: sortedShelfNames.slice(0, 10),
    });

    return res.status(200).json({ selected });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const addToShelfByName = async (req, res) => {
  const { bookId, name } = req.body;
  if (!bookId) {
    return res.status(400).json({ msg: "Book Id is required!" });
  }

  try {
    const shelf = await Shelf.findOneAndUpdate(
      { $and: [{ name: name }, { owner: req.user.userId }] },
      {
        $addToSet: {
          books: bookId,
        },
      }
    );
    if (name === "up next") {
      await Shelf.findOneAndUpdate(
        { $and: [{ name: "to read" }, { owner: req.user.userId }] },
        {
          $addToSet: {
            books: bookId,
          },
        }
      );
    }
    return res.status(200).json({ shelf });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const removeFromShelfByName = async (req, res) => {
  const { bookId, name } = req.body;

  if (!bookId) {
    return res.status(400).json({ msg: "Book Id is required!" });
  }

  try {
    const shelf = await Shelf.findOneAndUpdate(
      { $and: [{ name: name }, { owner: req.user.userId }] },
      {
        $pull: {
          books: bookId,
        },
      }
    );

    if (name === "to read") {
      await Shelf.findOneAndUpdate(
        { $and: [{ name: "up next" }, { owner: req.user.userId }] },
        {
          $pull: {
            books: bookId,
          },
        }
      );
    }

    return res.status(200).json({ shelf });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const removeFromShelf = async (req, res) => {
  const { bookId, shelfId } = req.body;
  console.log(bookId);
  console.log(shelfId);

  if (!bookId || !shelfId) {
    return res.status(400).json({ msg: "Book Id and Shelf Id are required!" });
  }

  try {
    const shelf = await Shelf.findByIdAndUpdate(
      shelfId,
      {
        $pull: {
          books: bookId,
        },
      },
      { new: true }
    );
    return res.status(200).json({ shelf });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAllShelves = async (req, res) => {
  try {
    const userId = req.params.userId;
    const first = await Shelf.find({ $and: [{ owner: userId }, { type: 1 }] });
    const second = await Shelf.find({
      $and: [{ owner: userId }, { type: { $ne: 1 } }],
    }).sort({ name: "asc" });
    const shelves = [...first, ...second];
    return res.status(200).json({ shelves });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getShelvesInBookPage = async (req, res) => {
  try {
    const userId = req.params.userId;
    const shelves = await Shelf.find({
      $and: [{ owner: userId }, { type: { $ne: 1 } }],
    });
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
      $and: [
        { owner: req.user.userId },
        { books: { $in: [book] } },
        { type: { $ne: 1 } },
      ],
    });
    const ids = shelves.map((x) => x._id);
    const names = shelves.map((x) => x.name);

    return res.status(200).json({ ids, names });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getShelfStatusOfBook = async (req, res) => {
  const { bookId } = req.params;

  try {
    let toRead;
    let favorites;
    let upNext;

    let shelves = await Shelf.find({
      $and: [
        { owner: req.user.userId },
        { books: { $in: [bookId] } },
        { name: "to read" },
      ],
    });

    if (shelves.length > 0) toRead = true;
    else toRead = false;

    shelves = await Shelf.find({
      $and: [
        { owner: req.user.userId },
        { books: { $in: [bookId] } },
        { name: "favorites" },
      ],
    });

    if (shelves.length > 0) favorites = true;
    else favorites = false;

    shelves = await Shelf.find({
      $and: [
        { owner: req.user.userId },
        { books: { $in: [bookId] } },
        { name: "up next" },
      ],
    });

    if (shelves.length > 0) upNext = true;
    else upNext = false;

    return res.status(200).json({ toRead, favorites, upNext });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getShelf = async (req, res) => {
  const { shelfId } = req.params;
  try {
    let shelf = await Shelf.findById(shelfId)
      .populate("books")
      .sort({ createdAt: -1 });

    const result = [];

    const bookData = shelf.books;

    for (const book of bookData) {
      const review = await Review.find({
        $and: [{ postedBy: shelf.owner }, { book: book._id }],
      })
        .sort({ createdAt: -1 })
        .lean();

      if (review.length > 0) {
        const reviewData = review[0];
        const newBook = {
          _id: book._id,
          title: book.title,
          author: book.author,
          thumbnail: book.thumbnail,
          userRating: review[0].rating,
          dateRead: review[0].dateRead || null,
        };

        result.push(newBook);
      } else
        result.push({
          _id: book._id,
          title: book.title,
          thumbnail: book.thumbnail,
          author: book.author,
        });
    }
    console.log(result);
    return res.status(200).json({ shelf, books: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const editShelf = async (req, res) => {
  const { shelfId, name } = req.body;
  try {
    const shelf = await Shelf.findByIdAndUpdate(
      shelfId,
      { name },
      { new: true }
    );
    return res.status(200).json({ shelf });
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

const getFavorites = async (req, res) => {
  const { bookId } = req.params;

  try {
    const shelves = await Shelf.find({
      $and: [{ name: "favorites" }, { books: { $in: [bookId] } }],
    }).populate("owner", "-password -secret");

    return res.status(200).json({ shelves });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getUpNextPeople = async (req, res) => {
  const { bookId } = req.params;
  const { userId } = req.user;
  try {
    const shelves = await Shelf.find({
      $and: [
        { name: "favorites" },
        { books: { $in: [bookId] } },
        { postedBy: { $ne: userId } },
      ],
    });

    const idList = shelves.map((one) => mongoose.Types.ObjectId(one._id));

    let pipeline = [
      {
        $lookup: {
          from: "reviews",
          localField: "detail",
          foreignField: "_id",
          as: "data",
        },
      },
      {
        $unwind: "$data",
      },
      {
        $match: {
          postedBy: id,
        },
      },
    ];

    

    const users = await User.find();

    return res.status(200).json({ shelves });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export {
  createShelf,
  bookToShelf,
  getAllShelves,
  getShelvesInBookPage,
  getSelectedShelves,
  getShelf,
  editShelf,
  deleteShelf,
  getTopShelvesOfBook,
  massAdd,
  addToShelfByName,
  removeFromShelfByName,
  getShelfStatusOfBook,
  removeFromShelf,
  getFavorites,
};
