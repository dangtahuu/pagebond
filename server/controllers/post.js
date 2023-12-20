import Post from "./../models/post.js";
import User from "./../models/user.js";
import Book from "../models/book.js";
import Review from "../models/review.js";
import Trade from "../models/trade.js";
import SpecialPost from "../models/specialPost.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Log from "../models/log.js";
import Hashtag from "../models/hashtag.js";
import shuffle from "../utils/shuffle.js";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const createPost = async (req, res) => {
  const { text, image, title, hashtag, spoiler } = req.body;

  if (!text.length) {
    return res.status(400).json({ msg: "You need to provide some content!" });
  }

  try {
    let hashtagsIds = [];
    if (hashtag.length) {
      let uniqueTags = [...new Set(hashtag)];
      for (const one of uniqueTags) {
        let tag;
        tag = await Hashtag.findOneAndUpdate(
          { name: one },
          { $inc: { numberOfPosts: 1 } }
        );
        if (!tag) {
          tag = await Hashtag.create({ name: one });
        }
        hashtagsIds.push(tag._id);
      }
    }

    const post = await Post.create({
      text,
      postedBy: req.user.userId,
      image,
      title,
      hashtag: hashtagsIds,
      spoiler,
    });

    const postWithUser = await Post.findById(post._id)
      .populate("postedBy", "-password -secret")
      .populate("hashtag");
    return res
      .status(200)
      .json({ post: postWithUser, msg: "Create new post succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAll = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await Post.find({}).estimatedDocumentCount();
    return res.status(200).json({ posts, postsCount });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAllReported = async (req, res) => {
  try {
    const posts = await Post.find({ reported: true })
      .populate("postedBy", "-password -secret")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await Post.find({}).estimatedDocumentCount();
    return res.status(200).json({ posts, postsCount });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const search = async (req, res) => {
  const term = JSON.parse(decodeURIComponent(req.query.term));
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 10;
  if (!term.length) {
    return res.status(400).json({ msg: "Search term is required!" });
  }

  try {
    let results;

    if (term.startsWith("#")) {
      const hashtag = await Hashtag.findOne({ name: term.slice(1) });
      results = await Post.aggregate([
        { $match: { hashtag: { $in: [hashtag._id] } } },
        {
          $addFields: {
            popularity: {
              $add: [{ $size: "$likes" }, { $size: "$comments" }],
            },
          },
        },
        { $sort: { popularity: -1 } },
        { $skip: (page - 1) * perPage },
        { $limit: perPage },
        {
          $project: {
            _id: 1,
          },
        },
      ]);
      console.log(results);
    } else {
      const regexPattern = term
        .split(" ")
        .map((word) => `(?=.*\\b${word}\\b)`)
        .join("");

      const regex = new RegExp(regexPattern, "i");

      const hashtag = await Hashtag.findOne({ name: term.slice(1) });
      results = await Post.aggregate([
        {
          $match: {
            $or: [{ title: { $regex: regex } }, { text: { $regex: regex } }],
          },
        },
        {
          $addFields: {
            popularity: {
              $add: [{ $size: "$likes" }, { $size: "$comments" }],
            },
          },
        },
        { $sort: { popularity: -1 } },
        { $skip: (page - 1) * perPage },
        { $limit: perPage },
        {
          $project: {
            _id: 1,
          },
        },
      ]);
    }

    let posts = [];
    if (results.length > 0) {
      for (const id of results) {
        const post = await Post.findById(id)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("hashtag");

        posts.push(post);
      }
    }
    return res.status(200).json({ results: posts });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const uploadImage = async (req, res) => {
  try {
    const path = req.files.image.path;
    // console.log(path);
    const result = await cloudinary.v2.uploader.upload(path);
    return res.status(200).json({
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

// get one post for edit
const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag");
    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }
    return res.status(200).json({ post });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

// get all posts with user's follower
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    let { following } = user;
    following.push(req.user.userId);

    // pagination

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const posts = await Post.find({ postedBy: { $in: following } })
      .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 })
      .limit(perPage);
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text, image, title, hashtag, spoiler } = req.body;
    if (!text.length) {
      return res.status(400).json({ msg: "You need to provide some content!" });
    }
    const oldPost = await Post.findById(postId).populate("hashtag");

    if (!oldPost) {
      return res.status(400).json({ msg: "No post found!" });
    }

    const oldTags = [...new Set(oldPost.hashtag.map((one) => one.name))];
    const newTags = [...new Set(hashtag)];
    let hashtagIds = [];
    if (newTags !== oldTags) {
      if (oldTags.length > 0) {
        for (const one of oldTags) {
          await Hashtag.findOneAndUpdate(
            { name: one },
            { $inc: { numberOfPosts: -1 } }
          );
        }
      }
      if (newTags.length > 0) {
        for (const one of newTags) {
          let result = await Hashtag.findOneAndUpdate(
            { name: one },
            { $inc: { numberOfPosts: 1 } }
          );
          if (!result) result = await Hashtag.create({ name: one });
          hashtagIds.push(result._id);
        }
      }
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        text,
        image,
        title,
        hashtag: hashtagIds,
        spoiler
      },
      { new: true, populate: { path: "hashtag" } }
    );

    return res.status(200).json({ msg: "Updated posts!", post: post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }
    if (post.image && post.image.public_id) {
      await cloudinary.v2.uploader.destroy(post.image.public_id);
    }

    if (post.hashtag.length > 0) {
      const uniqueTags = [...new Set(post.hashtag)];
      for (const one of uniqueTags) {
        await Hashtag.findOneAndUpdate(
          { name: one },
          { $inc: { numberOfPosts: -1 } }
        );
      }
    }

    return res.status(200).json({ msg: "Deleted post!" });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

/// like
const likePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: req.user.userId },
      },
      {
        new: true,
      }
    );

    const user = await User.findByIdAndUpdate(post.postedBy, {
      $inc: { points: 5 },
    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: "Post",
      type: 3,
      points: 5,
    });

    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const unlikePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: req.user.userId },
      },
      {
        new: true,
      }
    );

    const user = await User.findByIdAndUpdate(post.postedBy, {
      $inc: { points: -5 },
    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: "Post",
      type: 4,
      points: -5,
    });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};
// comment
const addComment = async (req, res) => {
  try {
    const { postId, comment, image } = req.body;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            text: comment,
            postedBy: req.user.userId,
            image,
          },
        },
      },
      {
        new: true,
      }
    )
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag");

    const user = await User.findByIdAndUpdate(post.postedBy, {
      $inc: { points: 20 },
    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: "Post",
      type: 5,
      points: 20,
    });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const removeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.body;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { _id: commentId } },
      },
      {
        new: true,
      }
    )
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag");

    const user = await User.findByIdAndUpdate(post.postedBy, {
      $inc: { points: -20 },
    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: "Post",
      type: 6,
      points: -20,
    });

    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const totalPosts = async (req, res) => {
  try {
    const totalPosts = await Post.find({}).estimatedDocumentCount();
    return res.status(200).json({ totalPosts });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

const getPostsWithUserId = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const userId = req.params.userId;
    const posts = await Post.find({ postedBy: { _id: userId } })
      .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag")
      .sort({
        createdAt: -1,
      })
      .limit(perPage);

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getDetailPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag")
      .sort({
        createdAt: -1,
      });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
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
        const randomPostId = await Post.aggregate([
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

        const post = await Post.findById(randomPostId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("hashtag");
        // .populate("book");
        if (post) result.push(post);
      }
    }

    const peopleListPlus = [...peopleList, user._id];

    const randomPostId = await Post.aggregate([
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

    const post = await Post.find({ _id: { $in: randomPostId } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag");

    // .populate("book");

    if (post.length > 0) result = [...result, ...post];

    return res.status(200).json({ posts: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getPopular = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const aggregated = await Post.aggregate([
      {
        $match: {
          createdAt: { $gt: sevenDaysAgo },
        },
      },
      {
        $addFields: {
          totalLikesAndComments: {
            $add: [{ $size: "$likes" }, { $size: "$comments" }],
          },
        },
      },
      {
        $sort: {
          totalLikesAndComments: -1,
        },
      },
      {
        $limit: 20,
      },
      { $project: { _id: 1 } },
    ]);

    const idsList = [];
    aggregated.forEach((one) => {
      idsList.push(one._id);
    });

    const posts = await Post.find({ _id: { $in: idsList } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag");

    // .populate("book");

    return res.status(200).json({ posts });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: error });
  }
};

const report = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        reported: true,
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

const dismissReport = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        reported: false,
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

export {
  createPost,
  getAll,
  getAllReported,
  search,
  uploadImage,
  editPost,
  getPost,
  deletePost,
  getFollowing,
  likePost,
  unlikePost,
  addComment,
  removeComment,
  totalPosts,
  getPostsWithUserId,
  getDetailPost,
  getDiscover,
  getPopular,
  report,
  dismissReport,
};
