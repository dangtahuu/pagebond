import News from "../models/news.js";
import Question from "../models/question.js";
import User from "../models/user.js";
import Log from "../models/log.js";
import Hashtag from "../models/hashtag.js";
import Post from "./../models/post.js";
import mongoose from "mongoose";

const create = async (req, res, next) => {
  const { progress, book } = req.body;
  if (!book) {
    return res.status(400).json({ msg: "Title are required!" });
  }

  try {

  const post = await Question.create({
      book: book.id,
    progress
    });

    req.body = { ...req.body, detail: post._id, postType: "Question" };
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const edit = async (req, res) => {
  try {
    const { detail, progress, postId } = req.body;
   
    await Question.findByIdAndUpdate(detail, {
      progress,
    });

    const post = await Post.findById(postId)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate({
        path: "detail",
        populate: { path: "book" },
      })
      .populate("hashtag");

    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }

    return res.status(200).json({ post });
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

    return res.status(200).json({ msg: "Deleted post!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAllWithBook = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.userId;
    let sort = req.query.sort || "popularity";
   
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const pipeline = [
      {
        $lookup: {
          from: "questions",
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
     
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
    ]

    if(sort==="start") {
      pipeline.push(
      {
        $sort: { "data.progress": 1 },
      })
    } else if (sort==="finish"){
      pipeline.push(
        {
          $sort: { "data.progress": -1 },
        })
    } else {
      pipeline.push(
        {
          $sort: { [sort]: -1 },
        })
    }

    const aggResult = await Post.aggregate(pipeline);

    const ids = aggResult.map((one) => one._id.toString());

    let posts = [];

    for (const id of ids) {
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

export {
  create,
  edit,
  deleteOne,
  getAllWithBook,
};
