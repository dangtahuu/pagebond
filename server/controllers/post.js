import Post from "./../models/post.js";
import User from "./../models/user.js";
import Book from "../models/book.js";
import Review from "../models/review.js";
import Trade from "../models/trade.js";
import SpecialPost from "../models/specialPost.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Log from "../models/log.js";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const createPost = async (req, res) => {
  const { text, image, title } = req.body;

  if (!text.length) {
    return res.status(400).json({ msg: "You need to provide some content!" });
  }

  try {
    const post = await Post.create({
      text,
      postedBy: req.user.userId,
      image,
      title,
    });

    const postWithUser = await Post.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    );
    return res
      .status(200)
      .json({ post: postWithUser, msg: "Create new post succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const allPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const posts = await Post.find({})
      .populate("postedBy", "-password -secret")
      .limit(perPage)
      .skip((page - 1) * perPage)
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
      .populate("comments.postedBy", "-password -secret");
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
    const { text, image, title } = req.body;
    if (!text.length) {
      return res.status(400).json({ msg: "You need to provide some content!" });
    }
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        text,
        image,
        title,
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
      
      $inc: { points: 5 }

    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: 'Post',
      type:3,
      points: 5,
    })

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
      
      $inc: { points: -5 }

    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: 'Post',
      type:4,
      points: -5,
    })
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
      .populate("comments.postedBy", "-password -secret");

      const user = await User.findByIdAndUpdate(post.postedBy, {
      
        $inc: { points: 20 }
  
      });
  
      const log = await Log.create({
        toUser: post.postedBy,
        fromUser: req.user.userId,
        linkTo: post._id,
        typeOfLink: 'Post',
        type:5,
        points: 20,
      })
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
      .populate("comments.postedBy", "-password -secret");

      const user = await User.findByIdAndUpdate(post.postedBy, {
      
        $inc: { points: -20 }
  
      });
  
      const log = await Log.create({
        toUser: post.postedBy,
        fromUser: req.user.userId,
        linkTo: post._id,
        typeOfLink: 'Post',
        type:6,
        points: -20,
      })

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
    const userId = req.params.userId;
    const posts = await Post.find({ postedBy: { _id: userId } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .sort({
        createdAt: -1,
      });
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

    const suggestionIds = suggestion.map((one)=>mongoose.Types.ObjectId(one))

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
  
        const post = await Post.findById(randomPostId)
          .populate("postedBy", "-password -secret")
          .populate("comments.postedBy", "-password -secret")
          // .populate("book");
        if (post) result.push(post);
      }
    }

    const peopleListPlus = [...peopleList, user._id]

      const randomPostId = await Post.aggregate([
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
              {
                $or: [
                  { likes: { $in: peopleList } },
                  {
                    comments: { $elemMatch: { postedBy: {$in: peopleList} } } ,
                  },
                ],
              },
              {
                postedBy: {$nin: peopleListPlus}
              },
              
            ],
          },
        },
        { $sample: { size: 10 } },
        { $project: { _id: 1 } }, 
      ]);

      const post = await Post.find({_id: {$in: randomPostId}})
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        // .populate("book");

      if (post.length>0) result = [...result,...post];

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
        createdAt: { $gt: sevenDaysAgo }
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

    const idsList = []
    aggregated.forEach((one)=>{idsList.push(one._id)})

    const posts = await Post.find({ _id: { $in: idsList } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      // .populate("book");

    return res.status(200).json({ posts });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: error });
  }
};

export {
  createPost,
  allPosts,
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
  getPopular
};
