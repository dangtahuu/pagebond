import mongoose from "mongoose";
import Trade from "../models/trade.js";
import cloudinary from "cloudinary";
import User from "../models/user.js";
import Log from "../models/log.js";
import Question from "../models/question.js";
import shuffle from "../utils/shuffle.js";
import { BingChat } from "bing-chat-rnz";

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
  const { text, title, book, image } = req.body;

  try {
    if (!text || !title || !book) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }
    const post = await Question.create({
      text,
      title,
      postedBy: req.user.userId,
      image,
      book: book.id,
    });

    const postWithUser = await Question.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    );
    return res
      .status(200)
      .json({ post: postWithUser, msg: "Create new trade post succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAll = async (req, res) => {
  try {
    const posts = await Question.find({})
      .populate("postedBy", "-password -secret")
      .sort({ createdAt: -1 })

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
    const posts = await Question.find({reported: true})
      .populate("postedBy", "-password -secret")
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
      .populate("book");
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
    const { text, title, image } = req.body;

    if (!text || !title) {
      return res
        .status(400)
        .json({ msg: "Please provide all required values" });
    }

    const post = await Trade.findByIdAndUpdate(
      postId,
      {
        text,
        title,
        image,
      },
      {
        new: true,
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
    const question = `Book ${book.title}, ${title}?. ${text}`
    const aiRes = await api.sendMessage(question);
    // console.log('iiiiiiiiiiiiii')
console.log(aiRes.text)


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
      .populate("comments.postedBy", "-password -secret");

      console.log(post)
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
      .populate("comments.postedBy", "-password -secret");
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
      .populate("comments.postedBy", "-password -secret");
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
    const userId = req.params.userId;
    const posts = await Question.find({ postedBy: { _id: userId } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .sort({
        createdAt: -1,
      });
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await Question.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    let { following } = user;
    following.push(req.user.userId);

    // pagination

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const posts = await Trade.find({ postedBy: { $in: following } })
      .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
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
          .populate("book");
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
       reported: true
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
       reported: false
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
  create,
  getAll,
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
  getAllReported
};
