import Book from "../models/book.js";
import Post from "../models/post.js";
import Review from "../models/review.js";
import User from "../models/user.js";
import removeHtmlTags from "../utils/removeHtml.js";
import sortObjectDes from "../utils/sortObjectDes.js";
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const searchBook = async (req, res) => {
  const term = req.query.term;
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;
  if (!term.length) {
    return res.status(400).json({ msg: "Search term is required!" });
  }

  try {
    const results = await Book.find({ title: { $regex: term, $options: "i" } })
      .limit(perPage)
      .skip((page - 1) * perPage);

    if (!results) {
      return res.status(400).json({ msg: "No result found!" });
    }

    return res.status(200).json({ books: results, perPage });
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

    const posts = await Review.find({
      $and: [{ postedBy: userId }, { rating: { $gt: 3 } }],
    })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret");

    const uniqueBookIds = new Set();

    for (const obj of posts) {
      if (!uniqueBookIds.has(obj.book)) {
        uniqueBookIds.add(obj.book.toString());
      }
    }

    const uniqueBookIdsArray = Array.from(uniqueBookIds);
    console.log("aaaaaa");
    console.log(uniqueBookIds);
    const shuffledBookIds = shuffle(uniqueBookIdsArray);
    const idsList = shuffledBookIds.splice(0, limit);

    let similarIds = [];
    let original = [];

    console.log(idsList);
    for (const id of idsList) {
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
      pagination = 1
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

    // pipeline.push({ $group: { _id: null, count: { $sum: 1 } } });
    // const bookCount = await Book.aggregate(pipeline);
    // console.log(bookCount[0].count);
console.log(pagination)
    // pipeline.pop();
  
    pipeline.push({
      $skip: (pagination - 1) * 50,
    });
    pipeline.push({
      $limit: 50,
    });
    const books = await Book.aggregate(pipeline);
    console.log(books)

// console.log(books.slice(0,5))
    return res.status(200).json({ books });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const getPopularBooksWithGenre = async (req, res) => {
  try {
    const { limit, genre, rating, pacing, page } = req.query.limit;

    if (!genre) return res.status(400).json({ msg: "Genre is required!" });
    let allData;
    if (limit && limit != -1) {
      const today = new Date();
      const daysAgo = new Date(today);
      daysAgo.setDate(today.getDate() - limit);
      // const posts = await Post.find({ createdAt: { $gt: daysAgo } });
      const reviews = await Review.find({
        createdAt: { $gt: daysAgo },
      }).populate("book");
      // const trades = await Trade.find({ createdAt: { $gt: daysAgo } });
      allData = [...reviews];
    } else {
      // const posts = await Post.find({});
      const reviews = await Review.find({}).populate("book");

      // console.log(reviews[0])
      // const trades = await Trade.find({});
      allData = [...reviews];
    }
    // console.log(allData[0])
    const books = {};
    if (genre) {
      for (const post of allData) {
        if (
          post.book.genres?.includes(genre) ||
          post.book.topShelves?.includes(genre)
        )
          books[post.book._id] = (books[post.book._id] || 0) + 1;
      }
    } else {
      for (const post of allData) {
        books[post.book] = (books[post.book] || 0) + 1;
      }
    }

    const sortedBooks = sortObjectDes(books);

    const topBooks = Object.fromEntries(
      Object.entries(sortedBooks).slice(0, 20)
    );

    const topBooksIds = Object.keys(topBooks);

    const list = [];
    for (const id of topBooksIds) {
      const detailedBook = await Book.find({
        _id: id,
      });
      list.push(...detailedBook);
    }

    return res.status(200).json({ books: list });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

export {
  searchBook,
  getBook,
  deleteAll,
  editAll,
  getSimilarBooks,
  getSimilarBooksForMultipleBooks,
  handleGoogle,
  getPopularGenres,
  fixGenres,
  getPopularBooks,
  getPopularBooksWithGenre,
};
