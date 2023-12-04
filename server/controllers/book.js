import Book from "../models/book.js";
import Post from "../models/post.js";
import Review from "../models/review.js";
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

    const postsCount = await Review.countDocuments({ book: id });

    
      let ratingSum = 0,
        contentSum = 0,
        developmentSum = 0,
        pacingSum = 0,
        writingSum = 0,
        insightsSum = 0;
      const allPosts = await Review.find({ book: id });
      allPosts.forEach((post) => {
        ratingSum += post.rating;
        contentSum += post.content;
        developmentSum += post.development;
        pacingSum += post.pacing;
        writingSum += post.writing;
        insightsSum += post.insights;
      });
      const ratingAvg = (ratingSum / postsCount).toFixed(1);
      const contentAvg = (contentSum / postsCount).toFixed(1);
      const developmentAvg = (developmentSum / postsCount).toFixed(1);
      const pacingAvg = (pacingSum / postsCount).toFixed(1);
      const writingAvg = (writingSum / postsCount).toFixed(1);
      const insightsAvg = (insightsSum / postsCount).toFixed(1);

    return res
      .status(200)
      .json({
        book: result,
        postsCount,
        ratingAvg,
        contentAvg,
        developmentAvg,
        pacingAvg,
        writingAvg,
        insightsAvg,
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

export { searchBook, getBook, deleteAll, editAll };
