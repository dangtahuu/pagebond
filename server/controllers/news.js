import News from "../models/news.js";
import cloudinary from "cloudinary";
import User from "../models/user.js";
import Log from "../models/log.js";
import Hashtag from "../models/hashtag.js";
import Post from "./../models/post.js";
import mongoose from "mongoose";
cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const create = async (req, res, next) => {
  const { title, type, book } = req.body;
  if (!title.length) {
    return res.status(400).json({ msg: "Title are required!" });
  }

  try {
    let post;

    if (book) {
      post = await News.create({
        book: book.id,
        type,
        title,
      });
    } else {
      post = await News.create({
        type,
        title,
      });
    }

    req.body = { ...req.body, detail: post._id, postType: "News" };
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const edit = async (req, res) => {
  try {
    const { title, type, postId, detail } = req.body;
    if (!title.length) {
      return res.status(400).json({ msg: "Title are required!" });
    }

    await News.findByIdAndUpdate(detail, {
      title,
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
    const post = await News.findByIdAndDelete(postId);
    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }

    return res.status(200).json({ msg: "Deleted post!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAdmin = async (req, res) => {
  try {
    const aggResult = await Post.aggregate([
      {
        $lookup: {
          from: "news",
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
          "data.type": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $limit: 3 },
    ]);

    const ids = aggResult.map((one) => one._id.toString());

    const posts = await Post.find({ _id: { $in: ids } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate({
        path: "detail",
        populate: { path: "book" },
      })
      .populate("hashtag");

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getFromOfficial = async (req, res) => {
  try {
    const days = new Date();
    const daysAgo = days.setDate(days.getDate() - 30);

    const aggResult = await Post.aggregate([
      {
        $lookup: {
          from: "news",
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
          $and: [{ "data.type": 2 }, { createdAt: { $gt: daysAgo } }],
        },
      },
      // {
      //   $sort: { createdAt: -1 },
      // },
      { $sample: { size: 3 } },
    ]);

    const ids = aggResult.map((one) => one._id.toString());

    const posts = await Post.find({ _id: { $in: ids } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate({
        path: "detail",
        populate: { path: "book" },
      })
      .populate("hashtag");

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAllWithBook = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.userId;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const aggResult = await Post.aggregate([
      {
        $lookup: {
          from: "news",
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
        $sort: { createdAt: -1 },
      },
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
    ]);

    const ids = aggResult.map((one) => one._id.toString());
    const posts = await Post.find({
      _id: { $in: ids },
    })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate({
        path: "detail",
        populate: { path: "book" },
      })
      .populate("hashtag");

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getFeatured = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const aggResult = await Post.aggregate([
      {
        $lookup: {
          from: "news",
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
          $and: [{  "data.book": mongoose.Types.ObjectId(bookId) }, { "data.type": { $ne: 0 } }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $limit: 1 },
    ]);

    if(aggResult.length===0) {
      return res.status(200).json({ post: [] });
    }
    const post = await Post.findById(aggResult[0]._id)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate({
        path: "detail",
        populate: { path: "book" },
      })
      .populate("hashtag");

    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const verify = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await News.findByIdAndUpdate(
      postId,
      {
        type: 2,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAllPending = async (req, res) => {
  try {
    const posts = await News.find({ type: 0 })
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await News.find({}).estimatedDocumentCount();
    return res.status(200).json({ posts, postsCount });
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
  getFeatured,
  getAdmin,
  getFromOfficial,
  getAllPending,
  verify,
};
