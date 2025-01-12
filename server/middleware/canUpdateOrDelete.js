import Post from "./../models/post.js";
import Review from "../models/review.js";
import News from "../models/news.js";
import Trade from "../models/trade.js";
import Question from "../models/question.js";

const canUpdateOrDeletePost = async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const { userId } = req.user;
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    if (userId !== post.postedBy.toString()) {
      return res.status(401).json({ msg: "Authentication invalid!" });
    }
    next();
  } catch (error) {
    console.log("Authentication invalid!");
    return res.status(401).json({ msg: "Authentication invalid!" });
  }
};

const canUpdateOrDeleteReview = async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const { userId } = req.user;
    const post = await Review.findById(post_id);
    if (!post) {
      return res.status(400).json({ msg: "No review found!" });
    }
    if (userId !== post.postedBy.toString()) {
      return res.status(401).json({ msg: "Authentication invalid!" });
    }
    next();
  } catch (error) {
    console.log("Authentication invalid!");
    return res.status(401).json({ msg: "Authentication invalid!" });
  }
};

const canUpdateOrDeleteTrade = async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const { userId } = req.user;
    const post = await Trade.findById(post_id);
    if (!post) {
      return res.status(400).json({ msg: "No trade found!" });
    }
    if (userId !== post.postedBy.toString()) {
      return res.status(401).json({ msg: "Authentication invalid!" });
    }
    next();
  } catch (error) {
    console.log("Authentication invalid!");
    return res.status(401).json({ msg: "Authentication invalid!" });
  }
};

const canUpdateOrDeleteNews = async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const { userId } = req.user;
    const post = await News.findById(post_id);
    if (!post) {
      return res.status(400).json({ msg: "No news found!" });
    }
    if (userId !== post.postedBy.toString()) {
      return res.status(401).json({ msg: "Authentication invalid!" });
    }
    next();
  } catch (error) {
    console.log("Authentication invalid!");
    return res.status(401).json({ msg: "Authentication invalid!" });
  }
};

const canUpdateOrDeleteQuestion = async (req, res, next) => {
  try {
    const post_id = req.params.id;
    const { userId } = req.user;
    const post = await Question.findById(post_id);
    console.log(userId)
    console.log(post.postedBy)
    // if (!post) {
    //   return res.status(400).json({ msg: "No question found!" });
    // }
    // if (userId !== post.postedBy.toString()) {
    //   return res.status(401).json({ msg: "Authentication invalid!" });
    // }
    next();
  } catch (error) {
    console.log("Authentication invalid!");
    return res.status(401).json({ msg: "Authentication invalid!" });
  }
};

export {
  canUpdateOrDeletePost,
  canUpdateOrDeleteReview,
  canUpdateOrDeleteTrade,
  canUpdateOrDeleteNews,
  canUpdateOrDeleteQuestion
};
