import SpecialPost from "../models/specialPost.js";
import cloudinary from "cloudinary";
import User from "../models/user.js";
import Log from "../models/log.js";
import Hashtag from "../models/hashtag.js";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const create = async (req, res) => {
  const { text, image, title, type, book, hashtag, spoiler } = req.body;
  if (!text.length || !title.length) {
    return res.status(400).json({ msg: "Content and title are required!" });
  }
  try {
    let post;

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

    if (book) {
      post = await SpecialPost.create({
        text,
        book: book.id,
        postedBy: req.user.userId,
        image,
        type,
        title,
        hashtag: hashtagsIds,
        spoiler
      });
    } else {
      post = await SpecialPost.create({
        text,
        postedBy: req.user.userId,
        image,
        type,
        title,
        hashtag: hashtagsIds,
      });
    }

    const postWithUser = await SpecialPost.findById(post._id)
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
    const posts = await SpecialPost.find({})
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await SpecialPost.find({}).estimatedDocumentCount();
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
      results = await SpecialPost.aggregate([
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
    } else {
      const regexPattern = term
        .split(" ")
        .map((word) => `(?=.*\\b${word}\\b)`)
        .join("");

      const regex = new RegExp(regexPattern, "i");

      const hashtag = await Hashtag.findOne({ name: term.slice(1) });
      results = await SpecialPost.aggregate([
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
        const post = await SpecialPost.findById(id)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("hashtag")
          .populate("book");

        posts.push(post);
      }
    }
    return res.status(200).json({ results: posts });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};
const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await SpecialPost.findById(postId)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag")
      .populate("book");
    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }
    return res.status(200).json({ post });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

const edit = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text, image, title, type, hashtag, spoiler } = req.body;
    if (!text.length || !title.length) {
      return res.status(400).json({ msg: "Content and title are required!" });
    }

    const oldPost = await SpecialPost.findById(postId).populate("hashtag");

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
    const post = await SpecialPost.findByIdAndUpdate(
      postId,
      {
        text,
        image,
        title,
        hashtag: hashtagIds,
        spoiler
      },
      {
        new: true,
        populate: { path: "hashtag" },
      }
    );
    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }
    return res.status(200).json({ msg: "Updated posts!", post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const deleteOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await SpecialPost.findByIdAndDelete(postId);
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

const like = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await SpecialPost.findByIdAndUpdate(
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
      typeOfLink: "SpecialPost",
      type: 3,
      points: 5,
    });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const unlike = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await SpecialPost.findByIdAndUpdate(
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
      typeOfLink: "SpecialPost",
      type: 4,
      points: -5,
    });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};
const addComment = async (req, res) => {
  try {
    const { postId, comment, image } = req.body;
    const post = await SpecialPost.findByIdAndUpdate(
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
      typeOfLink: "SpecialPost",
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
    const post = await SpecialPost.findByIdAndUpdate(
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
      typeOfLink: "SpecialPost",
      type: 6,
      points: -20,
    });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getWithUser = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const userId = req.params.userId;
    const posts = await SpecialPost.find({ postedBy: { _id: userId } })
    .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
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

const getAdmin = async (req, res) => {
  try {
    const posts = await SpecialPost.find({ type: 1 })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag")
      .sort({
        createdAt: -1,
      })
      .limit(3);

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getOfficial = async (req, res) => {
  try {
    const days = new Date();
    days.setDate(days.getDate() - 7);

    const randomPostIds = await SpecialPost.aggregate([
      {
        $match: {
          type: 2,
          createdAt: { $gte: days },
        },
      },
      { $sample: { size: 3 } },
    ]);

    const postIds = randomPostIds.map((post) => post._id);

    const posts = await SpecialPost.find({ _id: { $in: postIds } })
      .populate("postedBy", "-password -secret")
      .populate("hashtag");

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

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

    const posts = await SpecialPost.find({ postedBy: { $in: following } })
      .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag")
      .sort({ createdAt: -1 })
      .limit(perPage);
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAllWithBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const posts = await SpecialPost.find({
      $and: [{ book: id }, { type: { $ne: 0 } }],
    })
      .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 })
      .limit(perPage);
    console.log(posts);
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const posts = await SpecialPost.find({
      $and: [{ book: id }, { type: { $ne: 0 } }],
    })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 })
      .limit(1);

    return res.status(200).json({ post: posts[0] });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getMy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const posts = await SpecialPost.find({
      $and: [{ book: id }, { postedBy: userId }],
    })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts });
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

    const aggregated = await SpecialPost.aggregate([
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

    const posts = await SpecialPost.find({ _id: { $in: idsList } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag");

    return res.status(200).json({ posts });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: error });
  }
};

const report = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await SpecialPost.findByIdAndUpdate(
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
    const post = await SpecialPost.findByIdAndUpdate(
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

const verify = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await SpecialPost.findByIdAndUpdate(
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

const getAllReported = async (req, res) => {
  try {
    const posts = await SpecialPost.find({ reported: true })
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await SpecialPost.find({}).estimatedDocumentCount();
    return res.status(200).json({ posts, postsCount });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAllPending = async (req, res) => {
  try {
    const posts = await SpecialPost.find({ type: 0 })
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await SpecialPost.find({}).estimatedDocumentCount();
    return res.status(200).json({ posts, postsCount });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export {
  create,
  getAll,
  search,
  getOne,
  edit,
  deleteOne,
  like,
  unlike,
  addComment,
  removeComment,
  getWithUser,
  getFollowing,
  getAllWithBook,
  getFeatured,
  getMy,
  getAdmin,
  getOfficial,
  report,
  dismissReport,
  getAllReported,
  getAllPending,
  verify,
};
