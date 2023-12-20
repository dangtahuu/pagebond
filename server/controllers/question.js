import mongoose from "mongoose";
import Trade from "../models/trade.js";
import cloudinary from "cloudinary";
import User from "../models/user.js";
import Log from "../models/log.js";
import Question from "../models/question.js";
import shuffle from "../utils/shuffle.js";
import { BingChat } from "bing-chat-rnz";
import Hashtag from "../models/hashtag.js";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const api = new BingChat({
  cookie:
    "1WuqLKrFr0QR_kEOqCT6qMy_4VBUK_RWZxOfeXFzNaBLZy6qn4PCvtw1xQnyEkyVFtDRwafbowdR6rtzMbs__YbnHJuQxgmm6NOhlnaUrUc4elZODqv1cjQNpGHH7bBNDZeBpDF17PfdtUAKFQfivNmn2Vg2IC_BiIEDPSpWMkTE9q77BL_1HW_jLmyofo3CkJIxNRXXSXo3uPDjfqy7YCjiT3vDJlpjeST9i5nEUyEk",
});

const create = async (req, res) => {
  const { text, title, book, image, hashtag, spoiler } = req.body;

  try {
    if (!text || !title || !book) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }

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
    const post = await Question.create({
      text,
      title,
      postedBy: req.user.userId,
      image,
      book: book.id,
      hashtag: hashtagsIds,
      spoiler,
    });

    const postWithUser = await Question.findById(post._id)
      .populate("postedBy", "-password -secret")
      .populate("hashtag");

    return res
      .status(200)
      .json({ post: postWithUser, msg: "Create new question succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
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
      results = await Question.aggregate([
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
      results = await Question.aggregate([
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
        const post = await Question.findById(id)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("book")
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

const getAll = async (req, res) => {
  try {
    const posts = await Question.find({})
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });

    if (!posts) {
      return res.status(400).json({ msg: "No questions found!" });
    }
    const postsCount = await Question.find({}).estimatedDocumentCount();
    return res.status(200).json({ posts, postsCount });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getAllReported = async (req, res) => {
  try {
    const posts = await Question.find({ reported: true })
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await Question.find({}).estimatedDocumentCount();
    return res.status(200).json({ posts, postsCount });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Question.findById(postId)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag");

    if (!post) {
      return res.status(400).json({ msg: "No post found!" });
    }
    return res.status(200).json({ post });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

const getAllWithBook = async (req, res) => {
  try {
    const { id } = req.params;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const posts = await Question.find({ book: id })
      .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("hashtag")
      .populate("comments.postedBy", "-password -secret")
      .sort({ createdAt: -1 })
      .limit(perPage);

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getMy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const posts = await Question.find({
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

const edit = async (req, res) => {
  try {
    const postId = req.params.id;

    console.log(postId);

    const { text, title, image, hashtag, spoiler } = req.body;

    if (!text || !title) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }

    const oldPost = await Question.findById(postId).populate("hashtag");
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

    const post = await Question.findByIdAndUpdate(
      postId,
      {
        text,
        title,
        image,
        hashtag: hashtagIds,
        spoiler,
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
    return res.status(400).json({ msg: error });
  }
};

const deleteOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Question.findByIdAndDelete(postId);
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
    const post = await Question.findByIdAndUpdate(
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
      typeOfLink: "Question",
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
    const post = await Question.findByIdAndUpdate(
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
      typeOfLink: "Question",
      type: 4,
      points: -5,
    });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const addCommentAI = async (req, res) => {
  try {
    const { postId, title, text, book } = req.body;
    const question = `Book ${book.title}, ${title}?. ${text}`;
    const aiRes = await api.sendMessage(question);
    // console.log('iiiiiiiiiiiiii')
    console.log(aiRes.text);

    const post = await Question.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            text: aiRes.text,
            postedBy: "6561e80e6dfae0a11ba298b6",
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

    console.log(post);
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const addComment = async (req, res) => {
  try {
    const { postId, comment, image } = req.body;
    const post = await Question.findByIdAndUpdate(
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
      typeOfLink: "Question",
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
    const post = await Question.findByIdAndUpdate(
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
      typeOfLink: "Question",
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
    const posts = await Question.find({ postedBy: { _id: userId } })
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

    const posts = await Question.find({ postedBy: { $in: following } })
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
        const randomPostId = await Question.aggregate([
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

        const post = await Question.findById(randomPostId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          .populate("book")
          .populate("hashtag");

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

const report = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Question.findByIdAndUpdate(
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
    const post = await Question.findByIdAndUpdate(
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

const getAIRes = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Question.findById(postId).populate("book");

    let question = `In discussion of the book ${post.book.title} by ${post.book.author}, a reader posts "${post.title}. ${post.text}" What do you think about the post and the following replies it received? Don't analyze each reply like "the first reply says this", "the second says that". Just summarize them. Then give your own answer to the original post.`;

    post.comments.forEach((one, index) => {
      question = question + `[${one.text}]`;
    });

    const reply = await api.sendMessage(question, {
      variant: "Precise",
    });

    return res.status(200).json({ question, reply: reply.text });
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
  getAllWithBook,
  getMy,
  edit,
  deleteOne,
  like,
  unlike,
  addComment,
  removeComment,
  getWithUser,
  getFollowing,
  getDiscover,
  addCommentAI,
  report,
  dismissReport,
  getAllReported,
  getAIRes,
};
