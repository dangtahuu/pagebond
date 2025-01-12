import Book from "../models/book.js";
import Post from "../models/post.js";
import Review from "../models/review.js";
import User from "../models/user.js";
import removeHtmlTags from "../utils/removeHtml.js";
import sortObjectDes from "../utils/sortObjectDes.js";
import shuffle from "../utils/shuffle.js";
import { BingChat } from "bing-chat-rnz";
import mongoose from "mongoose";
import LogType from "../models/logType.js";
import Log from "../models/log.js";

const api = new BingChat({
  cookie:
    "1WuqLKrFr0QR_kEOqCT6qMy_4VBUK_RWZxOfeXFzNaBLZy6qn4PCvtw1xQnyEkyVFtDRwafbowdR6rtzMbs__YbnHJuQxgmm6NOhlnaUrUc4elZODqv1cjQNpGHH7bBNDZeBpDF17PfdtUAKFQfivNmn2Vg2IC_BiIEDPSpWMkTE9q77BL_1HW_jLmyofo3CkJIxNRXXSXo3uPDjfqy7YCjiT3vDJlpjeST9i5nEUyEk",
});

const searchBook = async (req, res) => {
  const term = JSON.parse(decodeURIComponent(req.query.term));
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 10;
  if (!term.length) {
    return res.status(400).json({ msg: "Search term is required!" });
  }
  const regexPattern = term
    .split(" ")
    .map((word) => `(?=.*\\b${word}\\b)`)
    .join("");

  const regex = new RegExp(regexPattern, "i");
  try {
    const results = await Book.find({
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } },
        { publisher: { $regex: regex } },
      ],
    }).limit(perPage);

    if (!results) {
      return res.status(400).json({ msg: "No result found!" });
    }
    console.log("yyyyyy");
    console.log(results);
    return res.status(200).json({ results, perPage });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const create = async (req, res) => {
  let {
    title,
    author,
    thumbnail,
    googleBookId,
    description,
    genres,
    publisher,
    publishedDate,
    previewLink,
    pageCount,
  } = req.body;

  try {
    if (genres) genres = genres.split(",");

    const book = await Book.create({
      title,
      author,
      thumbnail: thumbnail.url,
      googleBookId,
      description,
      genres,
      publisher,
      publishedDate,
      previewLink,
      pageCount,
    });

    console.log(book);
    return res.status(200).json({
      book,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const edit = async (req, res) => {
  let {
    title,
    author,
    thumbnail,
    googleBookId,
    description,
    genres,
    publisher,
    publishedDate,
    previewLink,
    pageCount,
  } = req.body;

  const {bookId} = req.params
  try {
    if (genres) genres = genres.split(",");

    const book = await Book.findByIdAndUpdate(bookId,{
      title,
      author,
      thumbnail: thumbnail?.url? thumbnail.url : thumbnail,
      googleBookId,
      description,
      genres,
      publisher,
      publishedDate,
      previewLink,
      pageCount,
    });

    return res.status(200).json({
      book
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getBook = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ msg: "Book Id is required!" });
  }

  try {
    const result = await Book.findById(id);

    if (!result) {
      return res.status(400).json({ msg: "No book found!" });
    }

    return res.status(200).json({
      book: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAll = async (req, res) => {
  try {
    const books = await Book.find({});

    return res.status(200).json({
      books,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAllReported = async (req, res) => {
  try {
    const books = await Book.find({ reported: true });

    return res.status(200).json({
      books,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getPromptsForBook = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ msg: "Book Id is required!" });
  }

  try {
    const result = await Book.findById(id);

    if (!result) {
      return res.status(400).json({ msg: "No book found!" });
    }

    const question = `give me 5 in-depth questions i can ask you about the book ${result.title}. format the result so i can use as an array in javascipt. don't say anything else in your answer`;
    const reply = await api.sendMessage(question, {
      variant: "Precise",
    });

    const startIndex = reply.text.indexOf("[\n");
    const endIndex = reply.text.lastIndexOf("]\n") + 1;

    const jsonText = reply.text.substring(startIndex, endIndex);
    const questionsArray = JSON.parse(jsonText);
    const suggestedRes = reply.detail.suggestedResponses.map((one) => one.text);
    return res.status(200).json({
      reply,
      suggestedRes,
      prompts: questionsArray,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getBookBySameAuthor = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ msg: "Book Id is required!" });
  }

  try {
    const originalBook = await Book.findById(id);

    const books = await Book.find({ author: originalBook.author });

    if (!books) {
      return res.status(400).json({ msg: "No book found!" });
    }

    return res.status(200).json({
      books,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

async function deleteAll(req, res) {
  // return('aaa')

  try {
    // const a = await Book.deleteMany({})
    const a = await Post.deleteMany({});

    console.log("success");
  } catch (e) {
    console.log(e);
  }
}

async function editAll(req, res) {
  // return('aaa')
  try {
    const allItems = await Book.find({});
    for (const item of allItems) {
      // console.log(item.genres)

      let genres = item.genres[0].split(",");

      await Book.findByIdAndUpdate(item._id, { genres });
    }
    // const a = await Book.deleteMany({})
    console.log("success");
    return res.status(200).json({ mes: "success" });
  } catch (e) {
    console.log(e);
  }
  return res.status(400).json({ mes: "fail" });
}

const getSimilarBooks = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(400).json({ msg: "Book Id is required!" });
    }

    const response = await fetch(
      `${process.env.MODEL_URL}/predict?book_id=${id}`
    );
    const { result } = await response.json();
    // console.log(data.result)
    // console.log(result)
    if (!result) {
      return res.status(200).json({ msg: "No recommended books!" });
    }

    const books = await Book.find({
      _id: { $in: result },
    });

    return res.status(200).json({
      books,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getSimilarBookForRandomBook = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }

    const posts = await Review.find({
      $and: [{ postedBy: userId }, { rating: { $gt: 3 } }],
    })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret");

    const uniqueBookIdsArray = Array.from(uniqueBookIds);
    console.log("aaaaaa");
    console.log(uniqueBookIds);
    const shuffledBookIds = shuffle(uniqueBookIdsArray);
    const idsList = shuffledBookIds.splice(0, limit);

    let similarIds = [];

    for (const id of idsList) {
      const response = await fetch(
        `${process.env.MODEL_URL}/predict?book_id=${id}`
      );
      let { result } = await response.json();
      // console.log
      if (result) {
        result.shift();
        let shuffled = shuffle(result);
        similarIds.push(result[0]);
      }
    }

    if (similarIds.length === 0) {
      return res.status(200).json({ msg: "No recommended books!" });
    }

    const books = await Book.find({
      _id: { $in: similarIds },
    });

    return res.status(200).json({
      books,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getSimilarBooksForMultipleBooks = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    const posts = await Post.aggregate([
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
          $and: [
            {
              "data.rating": { $gt: 3 },
            },

            {
              postedBy: mongoose.Types.ObjectId(userId),
            },
          ],
        },
      },
      { $sample: { size: 5 } },
    ]);

    console.log(posts);

    const ids = new Set();

    for (const obj of posts) {
      ids.add(obj.data.book.toString());
    }

    let similarIds = [];

    for (const id of ids) {
      const response = await fetch(
        `${process.env.MODEL_URL}/predict?book_id=${id}`
      );
      let { result } = await response.json();
      // console.log
      if (result) {
        result.shift();
        let shuffled = shuffle(result);
        // original.push(id)
        similarIds.push({ suggestedId: result[0], originalId: id });
      }
    }

    if (similarIds.length === 0) {
      return res.status(200).json({ msg: "No recommended books!", books: [] });
    }

    const books = [];
    for (const similarId of similarIds) {
      const [originalBook, suggestedBook] = await Promise.all([
        Book.findById(similarId.originalId),
        Book.findById(similarId.suggestedId),
      ]);
      books.push({ originalBook, suggestedBook });
    }

    return res.status(200).json({
      books,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const handleGoogle = async (req, res) => {
  const { book } = req.body;

  if (!book) {
    return res.status(400).json({ msg: "Book required!" });
  }

  // console.log(book)
  try {
    let foundBook = await Book.find({ googleBookId: book.id });

    if (foundBook.length === 0) {
      let genres = [];
      if (book.volumeInfo?.categories.length > 0) {
        const flatArray = book.volumeInfo.categories.flatMap((category) =>
          category.split("/")
        );

        // Step 2 and 3: Split each string and remove leading/trailing whitespaces
        const trimmedArray = flatArray.map((category) => category.trim());

        // Step 4: Deduplicate the values to get unique elements
        genres = [...new Set(trimmedArray)];
      }

      foundBook = await Book.create({
        title: book.volumeInfo.title,
        author: book.volumeInfo?.authors[0] || "",
        description: removeHtmlTags(book.volumeInfo?.description) || "",
        genres: genres,
        thumbnail: book.volumeInfo?.imageLinks?.thumbnail || "",
        publisher: book.volumeInfo?.publisher || "",
        publishedDate: book.volumeInfo?.publishedDate || "",
        previewLink: book.volumeInfo?.previewLink || "",
        pageCount: book.volumeInfo?.pageCount || "",
        googleBookId: book.id,
      });
    }

    return res.status(200).json({ book: foundBook });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const fixGenres = async (req, res) => {
  try {
    console.log("aaa");
    let allBooks = await Book.find({});
    // const genres = {};
    for (const book of allBooks) {
      const genres = book.genres.map((one) => one.trim());
      const newBook = await Book.findByIdAndUpdate(book._id, {
        genres,
      });
    }

    return res.status(200).json({ msg: "success" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getPopularGenres = async (req, res) => {
  try {
    let allBooks = await Book.find({});
    const genres = {};
    for (const book of allBooks) {
      book.genres.forEach((genre) => {
        genres[genre] = (genres[genre] || 0) + 1;
      });
    }

    const keyValueArray = Object.entries(genres);

    // Sort the array based on the values (index 1 in each pair)
    keyValueArray.sort((a, b) => b[1] - a[1]);

    // Convert the sorted array back to an object
    const sortedObject = Object.fromEntries(keyValueArray);

    // const sortedGenresNames = genres.sort((a, b) => genres[b] - genres[a]);

    return res.status(200).json({ genres: sortedObject });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getPopularBooks = async (req, res) => {
  try {
    const {
      limit = "All",
      genre,
      rating = "All",
      pacing = "All",
      page = "All",
      pagination = 1,
    } = req.query;
    let pipeline;
    let allData;
    if (limit !== "All") {
      const today = new Date();
      const daysAgo = new Date(today);
      daysAgo.setDate(today.getDate() - limit);
      pipeline = [
        {
          $lookup: {
            from: "reviews",
            let: { book: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$book", "$$book"] },
                      { $gt: ["$createdAt", daysAgo] },
                    ],
                  },
                },
              },
            ],
            as: "reviews",
          },
        },
        {
          $addFields: {
            reviewCount: { $size: "$reviews" },
          },
        },
        {
          $sort: {
            reviewCount: -1,
          },
        },
      ];
    } else {
      pipeline = [
        {
          $sort: {
            numberOfRating: -1,
          },
        },
      ];
    }

    if (rating !== "All") {
      const [minRating, maxRating] = rating.split("-").map(parseFloat);
      pipeline.push({
        $match: { rating: { $gte: minRating, $lte: maxRating } },
      });
    }

    if (page !== "All") {
      if (page.includes("<")) {
        const maxPage = parseFloat(page.replace("<", ""));
        pipeline.push({
          $match: { pageCount: { $lte: maxPage } },
        });
      } else if (page.includes(">")) {
        const minPage = parseFloat(page.replace(">", ""));
        pipeline.push({
          $match: { pageCount: { $gte: minPage } },
        });
      } else {
        const [minPage, maxPage] = rating.split("-").map(parseFloat);
        pipeline.push({
          $match: { pageCount: { $gte: minPage, $lte: maxPage } },
        });
      }
    }
    // const temp = await Book.aggregate(pipeline)
    // console.log(temp)
    const parsedGenre = JSON.parse(decodeURIComponent(genre)) || "All";

    // console.log(genre)
    if (parsedGenre !== "All") {
      pipeline.push({
        $match: {
          $or: [
            { genres: { $in: [parsedGenre] } },
            { topShelves: { $in: [parsedGenre] } },
          ],
        },
      });
    }

    if (pacing != "All") {
      pipeline.push({
        $match: { pacing: pacing },
      });
    }

    pipeline.push({
      $skip: (pagination - 1) * 48,
    });
    pipeline.push({
      $limit: 48,
    });
    const books = await Book.aggregate(pipeline);

    return res.status(200).json({ books });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const report = async (req, res) => {
  try {
    const { bookId, text } = req.body;
    const userId = req.user.userId;

    const book = await Book.findByIdAndUpdate(
      bookId,
      {
        reported: true,
      },
      {
        new: true,
      }
    );

    const logType = await LogType.findOne({ name: "report_book" });

    const log = await Log.create({
      fromUser: req.user.userId,
      type: logType._id,
      typeOfLink: "Book",
      linkTo: bookId,
      note: text,
    });

    return res.status(200).json({ book });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const dismissReport = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findByIdAndUpdate(
      bookId,
      {
        reported: false,
      },
      {
        new: true,
      }
    );

    const logType = await LogType.findOne({ name: "report_book" });

    const logs = await Log.updateMany(
      {
        $and: [{ linkTo: bookId }, { type: logType._id }],
      },
      {
        isDone: true,
      }
    );

    return res.status(200).json({ book });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export {
  searchBook,
  create,
  edit,
  getBook,
  getAll,
  getAllReported,
  getBookBySameAuthor,
  deleteAll,
  editAll,
  getSimilarBooks,
  getSimilarBooksForMultipleBooks,
  handleGoogle,
  getPopularGenres,
  fixGenres,
  getPopularBooks,
  getPromptsForBook,
  report,
  dismissReport,
};
