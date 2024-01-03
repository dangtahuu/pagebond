import Trade from "../models/trade.js";
import cloudinary from "cloudinary";
import User from "../models/user.js";
import Log from "../models/log.js";
import Hashtag from "../models/hashtag.js";
import Post from "./../models/post.js";

import mongoose from "mongoose";
import shuffle from "../utils/shuffle.js";

const create = async (req, res, next) => {
  const { location, address, condition, book } = req.body;

  try {
    if (!address || !location || !condition) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }

    const post = await Trade.create({
      location,
      book: book.id,
      address,
      condition,
    });

    req.body = { ...req.body, detail: post._id, postType: "Trade" };
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

    const aggResult = await Post.aggregate([
      {
        $lookup: {
          from: "trades",
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
      .populate("hashtag")

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};


const edit = async (req, res) => {
  try {
    const { detail, postId, location, address, condition} = req.body;

    if (!address || !location || !condition) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }
    await Trade.findByIdAndUpdate(
      detail,
      {
        location,
        address,
        condition,
      },
    
    );

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
    return res.status(200).json({ msg: "Updated posts!", post });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ msg: error });
  }
};

const deleteOne = async (req, res) => {
  try {
    const postId = req.detailId;
    const post = await Trade.findByIdAndDelete(postId);
    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }

    return res.status(200).json({ msg: "Deleted post!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getNearby = async (req, res) => {
  const { long, lat } = req.params;
  try {
    const result = await Trade.find({
      $and: [
        {
          location: {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: [long, lat],
              },
              $maxDistance: 10000,
            },
          },
        },
        { postedBy: { $ne: req.user.userId } },
      ],
    })
      .populate(
        "postedBy",
        "-password -secret -email -username -following -follower -role -about"
      )
      .populate("book")
      .populate("hashtag")
      .limit(50);

    console.log()
    const shuffled = shuffle(result)

    const posts = shuffled.slice(0,10)

    return res.status(200).json({ posts });
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

    if (suggestion.length > 0) {
      if (shuffledFollowing.length > 0)
        peopleList = [...suggestion, ...shuffledFollowing.splice(0, 10)];
      else peopleList = [...suggesion];
    } else
      return res
        .status(200)
        .json({ msg: "No suggestion at the moment", reviews: [] });

    let result = [];

    if (suggestion.length > 0) {
      for (const one of suggestion) {
        const randomPostId = await Trade.aggregate([
          {
            $match: {
              $and: [
                {
                  $and: [
                    { likes: { $nin: [mongoose.Types.ObjectId(userId)] } },
                    {
                      comments: { $not: { $elemMatch: { postedBy: mongoose.Types.ObjectId(userId) } } },
                    },
                  ],
                },
                 {postedBy: mongoose.Types.ObjectId(one)}
              ],
            },
          },
          { $sample: { size: 1 } },
          { $project: { _id: 1 } }, 
        ]);
  
        const post = await Trade.findById(randomPostId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("book")
          .populate("hashtag")
        if (post) result.push(post);
      }
    }

    // for (const one of peopleList) {
    //   const randomPostId = await RevTiew.aggregate([
    //     {
    //       $match: {
    //         $and: [
    //           {
    //             $and: [
    //               { likes: { $nin: [mongoose.Types.ObjectId(userId)] } },
    //               {
    //                 comments: { $not: { $elemMatch: { postedBy: mongoose.Types.ObjectId(userId) } } },
    //               },
    //             ],
    //           },
    //           {
    //             $or: [
    //               { likes: { $in: [one] } },
    //               {
    //                 comments: { $elemMatch: { postedBy: one } } ,
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     },
    //     { $sample: { size: 1 } },
    //     { $project: { _id: 1 } }, 
    //   ]);

    //   const post = await Review.findById(randomPostId)
    //     .populate("postedBy", "-password -secret")
    //     .populate("comments.postedBy", "-password -secret")
    //     .populate("book");
    //   if (post) result.push(post);
    // }

    return res.status(200).json({ posts: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};


export {
  create,
  getAllWithBook,
  edit,
  deleteOne,
  getNearby,
  getDiscover,
};
