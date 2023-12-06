import Book from "../models/book.js";
import Post from "../models/post.js";
import Review from "../models/review.js";
import User from "../models/user.js";

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

const getSimilarBooks = async (req, res) => {
  const id = req.params.id;
  try {

    if (!id) {
      return res.status(400).json({ msg: "Book Id is required!" });
    }

    const response = await fetch(`${process.env.MODEL_URL}/predict?book_id=${id}`)
    const {result} = await response.json()
    // console.log(data.result)
    // console.log(result)
    if (!result) {
      return res.status(200).json({ msg: "No recommended books!" });
    }

    const books = await Book.find({
      _id: { $in: result }, 
    });

    
    return res
      .status(200)
      .json({
      books
      });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getSimilarBooksForMultipleBooks = async (req, res) => {
  try {
    const limit = req.query.limit || 5
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
  
    const posts = await Review.find({ $and: [{postedBy: userId},{rating: {$gt: 3}}]  })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")

      const uniqueBookIds = new Set();
    
      for (const obj of posts) {
        if (!uniqueBookIds.has(obj.book)) {
          uniqueBookIds.add(obj.book);
        }
      }

      const uniqueBookIdsArray = Array.from(uniqueBookIds)
      console.log('aaaaaa')
      console.log(uniqueBookIds)
      const shuffledBookIds = shuffle(uniqueBookIdsArray)
      const idsList = shuffledBookIds.splice(0,limit)
   
    let similarIds = []

    for(const id of idsList) {
      const response = await fetch(`${process.env.MODEL_URL}/predict?book_id=${id}`)
      let {result} = await response.json()
      // console.log
      if(result) {
        result.shift()
        let shuffled = shuffle(result)
        similarIds.push(result[0])
      }
    }

    if (similarIds.length===0) {
      return res.status(200).json({ msg: "No recommended books!" });
    }

    const books = await Book.find({
      _id: { $in: similarIds }, 
    });

    return res
      .status(200)
      .json({
      books
      });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

export { searchBook, getBook, deleteAll, editAll, getSimilarBooks, getSimilarBooksForMultipleBooks };
