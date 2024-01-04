import mongoose, { mongo } from "mongoose";

import Review from "../models/review.js";
import User from "../models/user.js";
import Log from "../models/log.js";
import Book from "../models/book.js";
import Hashtag from "../models/hashtag.js";
import shuffle from "../utils/shuffle.js";
import Post from "./../models/post.js";
import Shelf from "../models/shelf.js";

const create = async (req, res, next) => {
  const {
    rating,
    book,
    content,
    development,
    pacing,
    writing,
    insights,
    dateRead,
  } = req.body;

  try {
    if (
      !rating ||
      !content ||
      !development ||
      !pacing ||
      !writing ||
      !insights ||
      !book
    ) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }

    const post = await Review.create({
      rating,
      book: book.id,
      content,
      development,
      pacing,
      writing,
      insights,
      dateRead,
    });

    const bookData = await Book.findById(book.id);

    let slowCount = await Review.countDocuments({
      $and: [{ book: book.id }, { pacing: "Slow" }],
    });
    let mediumCount = await Review.countDocuments({
      $and: [{ book: book.id }, { pacing: "Medium" }],
    });
    let fastCount = await Review.countDocuments({
      $and: [{ book: book.id }, { pacing: "Fast" }],
    });

    const mostPacingCount = Math.max(slowCount, mediumCount, fastCount);
    const newPacing =
      mostPacingCount === slowCount
        ? "Slow"
        : mostPacingCount === "Medium"
        ? "Medium"
        : "Fast";

    const numberOfRating = bookData.numberOfRating;
    const newNumberOfRating = bookData.numberOfRating + 1;

    const ratingAvg = (
      (bookData.rating * numberOfRating + rating) /
      newNumberOfRating
    ).toFixed(2);
    const contentAvg = (
      (bookData.content * numberOfRating + content) /
      newNumberOfRating
    ).toFixed(2);
    const developmentAvg = (
      (bookData.development * numberOfRating + development) /
      newNumberOfRating
    ).toFixed(2);
    const writingAvg = (
      (bookData.writing * numberOfRating + writing) /
      newNumberOfRating
    ).toFixed(2);
    const insightsAvg = (
      (bookData.insights * numberOfRating + insights) /
      newNumberOfRating
    ).toFixed(2);

    const newBook = await Book.findByIdAndUpdate(book.id, {
      rating: ratingAvg,
      content: contentAvg,
      development: developmentAvg,
      pacing: newPacing,
      writing: writingAvg,
      insights: insightsAvg,
      numberOfRating: newNumberOfRating,
    });

    await Shelf.findOneAndUpdate(
      { $and: [{ name: "to read" }, { owner: req.user.userId }] },
      {
        $pull: {
          books: book.id,
        },
      }
    );

    await Shelf.findOneAndUpdate(
      { $and: [{ name: "up next" }, { owner: req.user.userId }] },
      {
        $pull: {
          books: book.id,
        },
      }
    );

    req.body = { ...req.body, detail: post._id, postType: "Review" };
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAllWithBook = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.userId;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const sort = req.query.sort || "popularity";
    const filter = req.query.filter || "All";

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
          "data.book": mongoose.Types.ObjectId(bookId),
        },
      },
      {
        $addFields: {
          popularity: {
            $add: [{ $size: "$likes" }, { $size: "$comments" }],
          },
        },
      },
      { $sort: { [sort]: -1 } },
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
    ];

    if (filter !== "All") {
      pipeline.push({
        $match: { "data.rating": parseFloat(filter) },
      });
    }

    const reviews = await Post.aggregate(pipeline);

    const idList = reviews.map((review) => review._id);

    let posts = [];

    for (const id of idList) {
      const review = await Post.findById(id)
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        .populate({
          path: "detail",
          populate: { path: "book" },
        })
        .populate("hashtag");

      posts.push(review);
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const calculateRatingChart = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ book: id });

    const ratingCounts = {};

    reviews.forEach((item) => {
      ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
    });

    const result = [];
    for (let i = 0.5; i <= 5; i += 0.5) {
      if (ratingCounts[i]) {
        result.push({
          number: ratingCounts[i],
          rating: i,
        });
      } else {
        result.push({
          number: 0,
          rating: i,
        });
      }
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const edit = async (req, res) => {
  try {
    const {
      detail,
      rating,
      content,
      development,
      pacing,
      writing,
      insights,
      dateRead,
      postId,
    } = req.body;

    if (
      !rating ||
      !content ||
      !development ||
      !pacing ||
      !writing ||
      !insights
    ) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }

    console.log(dateRead);
    console.log("lllll");

    const post = await Review.findByIdAndUpdate(detail, {
      rating,
      content,
      development,
      pacing,
      writing,
      insights,
      dateRead,
    });

    if (!post) {
      return res.status(400).json({ msg: "No review found!" });
    }

    const newPost = await Review.findById(detail);

    const bookData = await Book.findById(post.book);

    let slowCount = await Review.countDocuments({
      $and: [{ book: post.book }, { pacing: "Slow" }],
    });
    let mediumCount = await Review.countDocuments({
      $and: [{ book: post.book }, { pacing: "Medium" }],
    });
    let fastCount = await Review.countDocuments({
      $and: [{ book: post.book }, { pacing: "Fast" }],
    });

    const mostPacingCount = Math.max(slowCount, mediumCount, fastCount);
    const newPacing =
      mostPacingCount === slowCount
        ? "Slow"
        : mostPacingCount === mediumCount
        ? "Medium"
        : "Fast";

    const numberOfRating = bookData.numberOfRating;
    // const newNumberOfRating = bookData.numberOfRating + 1

    const ratingAvg = (
      (bookData.rating * numberOfRating - post.rating + newPost.rating) /
      numberOfRating
    ).toFixed(2);
    const contentAvg = (
      (bookData.content * numberOfRating - post.content + newPost.content) /
      numberOfRating
    ).toFixed(2);
    const developmentAvg = (
      (bookData.development * numberOfRating -
        post.development +
        newPost.development) /
      numberOfRating
    ).toFixed(2);
    const writingAvg = (
      (bookData.writing * numberOfRating - post.writing + newPost.writing) /
      numberOfRating
    ).toFixed(2);
    const insightsAvg = (
      (bookData.insights * numberOfRating - post.insights + newPost.insights) /
      numberOfRating
    ).toFixed(2);

    const newBook = await Book.findByIdAndUpdate(post.book, {
      rating: ratingAvg,
      content: contentAvg,
      development: developmentAvg,
      pacing: newPacing,
      writing: writingAvg,
      insights: insightsAvg,
    });

    const postData = await Post.findById(postId)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate({
        path: "detail",
        populate: { path: "book" },
      })
      .populate("hashtag");
    console.log(postData);
    return res.status(200).json({ msg: "Updated review!", post: postData });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const deleteOne = async (req, res) => {
  try {
    const postId = req.detailId;
    const post = await Question.findByIdAndDelete(postId);
    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }

    const bookData = await Book.findById(post.book._id);
    let slowCount = await Review.countDocuments({
      $and: [{ book: post.book._id }, { pacing: "Slow" }],
    });
    let mediumCount = await Review.countDocuments({
      $and: [{ book: post.book._id }, { pacing: "Medium" }],
    });
    let fastCount = await Review.countDocuments({
      $and: [{ book: post.book._id }, { pacing: "Fast" }],
    });

    const mostPacingCount = Math.max(slowCount, mediumCount, fastCount);
    const newPacing =
      mostPacingCount === slowCount
        ? "Slow"
        : mostPacingCount === "Medium"
        ? "Medium"
        : "Fast";

    const numberOfRating = bookData.numberOfRating;
    const newNumberOfRating = bookData.numberOfRating - 1;
    if (newNumberOfRating !== 0) {
      const ratingAvg = (
        (bookData.rating * numberOfRating - post.rating) /
        newNumberOfRating
      ).toFixed(2);
      const contentAvg = (
        (bookData.content * numberOfRating - post.content) /
        newNumberOfRating
      ).toFixed(2);
      const developmentAvg = (
        (bookData.development * numberOfRating - post.development) /
        newNumberOfRating
      ).toFixed(2);
      const writingAvg = (
        (bookData.writing * numberOfRating - post.writing) /
        newNumberOfRating
      ).toFixed(2);
      const insightsAvg = (
        (bookData.insights * numberOfRating - post.insights) /
        newNumberOfRating
      ).toFixed(2);

      const newBook = await Book.findByIdAndUpdate(post.book._id, {
        rating: ratingAvg,
        content: contentAvg,
        development: developmentAvg,
        pacing: newPacing,
        writing: writingAvg,
        insights: insightsAvg,
        numberOfRating: newNumberOfRating,
      });
    } else {
      const newBook = await Book.findByIdAndUpdate(post.book._id, {
        rating: 0,
        content: 0,
        development: 0,
        pacing: "",
        writing: 0,
        insights: 0,
        numberOfRating: 0,
      });
    }

    return res.status(200).json({ msg: "Deleted post!" });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

const getDiscover = async (req, res) => {
  try {
    const { userId } = req.user;
    const suggestion = req.body.suggestion || [];
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    let { following } = user;

    let shuffledFollowing = shuffle(following);
    let peopleList;

    const suggestionIds = suggestion.map((one) => mongoose.Types.ObjectId(one));

    if (suggestionIds.length > 0) {
      if (shuffledFollowing.length > 0)
        peopleList = [...suggestionIds, ...shuffledFollowing.splice(0, 10)];
      else peopleList = [...suggestionIds];
    } else
      return res
        .status(200)
        .json({ msg: "No suggestion at the moment", reviews: [] });

    let result = [];

    if (suggestion.length > 0) {
      for (const one of suggestion) {
        const randomPostId = await Review.aggregate([
          {
            $match: {
              $and: [
                {
                  $and: [
                    { likes: { $nin: [mongoose.Types.ObjectId(userId)] } },
                    {
                      comments: {
                        $not: {
                          $elemMatch: {
                            postedBy: mongoose.Types.ObjectId(userId),
                          },
                        },
                      },
                    },
                  ],
                },
                { postedBy: mongoose.Types.ObjectId(one) },
              ],
            },
          },
          { $sample: { size: 1 } },
          { $project: { _id: 1 } },
        ]);

        const post = await Review.findById(randomPostId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("book")
          .populate("hashtag");

        if (post) result.push(post);
      }
    }

    const peopleListPlus = [...peopleList, user._id];

    const randomPostId = await Review.aggregate([
      {
        $match: {
          $and: [
            {
              $and: [
                { likes: { $nin: [mongoose.Types.ObjectId(userId)] } },
                {
                  comments: {
                    $not: {
                      $elemMatch: { postedBy: mongoose.Types.ObjectId(userId) },
                    },
                  },
                },
              ],
            },
            {
              $or: [
                { likes: { $in: peopleList } },
                {
                  comments: { $elemMatch: { postedBy: { $in: peopleList } } },
                },
              ],
            },
            {
              postedBy: { $nin: peopleListPlus },
            },
          ],
        },
      },
      { $sample: { size: 10 } },
      { $project: { _id: 1 } },
    ]);

    const post = await Review.find({ _id: { $in: randomPostId } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag");

    if (post.length > 0) result = [...result, ...post];

    return res.status(200).json({ posts: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getRandomReadBooks = async (req, res) => {
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
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag");

    const uniqueBookIds = new Set();

    for (const obj of posts) {
      if (!uniqueBookIds.has(obj.book)) {
        uniqueBookIds.add(obj.book);
      }
    }

    const shuffledBookIds = shuffle(uniqueBookIds);

    return res.status(200).json({ bookIds: shuffledBookIds.splice(0, 5) });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getDiary = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Review.find({
      $and: [{ postedBy: { _id: userId } }, { dateRead: { $ne: null } }],
    })
      .populate("book")
      .sort({
        dateRead: -1,
      });
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getRecent = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Review.find({
      $and: [{ postedBy: { _id: userId } }, { dateRead: { $ne: null } }],
    })
      .populate("book")
      .sort({
        dateRead: -1,
      })
      .limit(6);

    const books = posts.map((post) => post.book);
    return res.status(200).json({ books });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export {
  create,
  getAllWithBook,
  calculateRatingChart,
  edit,
  deleteOne,
  getDiscover,
  getDiary,
  getRecent,
};
