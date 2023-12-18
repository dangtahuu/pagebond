import Review from "../models/review.js";
import cloudinary from "cloudinary";
import User from "../models/user.js";
import mongoose, { mongo } from "mongoose";
import Log from "../models/log.js";
import Book from "../models/book.js";
import book from "../models/book.js";
import Hashtag from "../models/hashtag.js";
import shuffle from "../utils/shuffle.js";
cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});


const create = async (req, res) => {
  const {
    text,
    rating,
    book,
    image,
    title,
    content,
    development,
    pacing,
    writing,
    insights,
    dateRead,
    hashtag
  } = req.body;

  

  try {
    if (
      !text ||
      !rating ||
      !title ||
      !content ||
      !development ||
      !pacing ||
      !writing ||
      !insights
    ) {
      return res.status(400).json({ msg: "Please provide all required values" });
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

    const post = await Review.create({
      text,
      postedBy: req.user.userId,
      image,
      rating,
      book: book.id,
      title,
      content,
      development,
      pacing,
      writing,
      insights,
      dateRead,
      hashtag: hashtagsIds
    });

    const postWithUser = await Review.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    )
    .populate("hashtag")

    const bookData = await Book.findById(book.id)


    let slowCount = await Review.countDocuments({$and:[ {book: book.id},{pacing: "Slow"}] });
    let mediumCount = await Review.countDocuments({$and:[ {book: book.id},{pacing: "Medium"}] });
    let fastCount = await Review.countDocuments({$and:[ {book: book.id},{pacing: "Fast"}] });

    const mostPacingCount = Math.max(slowCount,mediumCount,fastCount)
    const newPacing = mostPacingCount === slowCount? "Slow":mostPacingCount==="Medium"? "Medium": "Fast"

    const numberOfRating = bookData.numberOfRating
    const newNumberOfRating = bookData.numberOfRating + 1
    
    const ratingAvg = ((bookData.rating*numberOfRating + rating)/ newNumberOfRating).toFixed(2);
    const contentAvg = ((bookData.content*numberOfRating + content)/ newNumberOfRating).toFixed(2);
    const developmentAvg = ((bookData.development*numberOfRating + development)/ newNumberOfRating).toFixed(2);
    const writingAvg = ((bookData.writing*numberOfRating + writing)/ newNumberOfRating).toFixed(2);
    const insightsAvg = ((bookData.insights*numberOfRating + insights)/ newNumberOfRating).toFixed(2);

    const newBook = await Book.findByIdAndUpdate(book.id,{
      rating: ratingAvg,
      content: contentAvg,
      development: developmentAvg,
      pacing: newPacing,
      writing: writingAvg,
      insights: insightsAvg,
      numberOfRating: newNumberOfRating
    });

    return res
      .status(200)
      .json({ post: postWithUser, msg: "Create new review succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAll = async (req, res) => {
  try {
    const posts = await Review.find({})
      .populate("postedBy", "-password -secret")
    .populate("hashtag")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await Review.find({}).estimatedDocumentCount();
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
      console.log('aaaa')
      const hashtag = await Hashtag.findOne({ name: term.slice(1) });
      results = await Review.aggregate([
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
        {$project: {
          _id: 1
        }}
      ]);

    } else {
      const regexPattern = term
        .split(" ")
        .map((word) => `(?=.*\\b${word}\\b)`)
        .join("");

      const regex = new RegExp(regexPattern, "i");

      const hashtag = await Hashtag.findOne({ name: term.slice(1) });
      results = await Review.aggregate([
        {
          $match: {
            $or: [
              { title: { $regex: regex } },
              { text: { $regex: regex } },
            ],
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
        {$project: {
          _id: 1
        }}
      ]);
    
    }

    let posts = []
    if (results.length>0) {
      for (const id of results) {
        const post = await Review.findById(id)
        .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag")
        
        posts.push(post)
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
    const post = await Review.findById(postId)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
      .populate("hashtag")

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
    const userId = req.user.userId;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const sort = req.query.sort;
    const rating = req.query.rating;

    let pipeline = [
      { $match: { book: mongoose.Types.ObjectId(id) } },
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


    if (rating!=="All") {
      const [minRating, maxRating] = rating
        .split("-")
        .map(parseFloat);
      pipeline.push({
        $match: { rating: { $gte: minRating, $lte: maxRating } },
      });
    }

    const reviews = await Review.aggregate(pipeline);

    const idList = reviews.map((review) => review._id);

    let posts = [];

    for (const id of idList) {
      const review = await Review.findById(id)
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
    .populate("hashtag")

      posts.push(review);
    }

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

    const posts = await Review.find({
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
    const {
      text,
      rating,
      image,
      title,
      content,
      development,
      pacing,
      writing,
      insights,
      dateRead,
      hashtag
    } = req.body;

    if (
      !text ||
      !rating ||
      !title ||
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
    const oldPost = await Review.findById(postId).populate("hashtag");

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

    const post = await Review.findByIdAndUpdate(
      postId,
      {
        text,
        image,
        rating,
        title,
        content,
        development,
        pacing,
        writing,
        insights,
        dateRead,
        hashtag: hashtagIds
      },
    );
    if (!post) {
      return res.status(400).json({ msg: "No review found!" });
    }

    const newPost = await Review.findById(postId).populate("postedBy", "-password -secret")
    .populate("comments.postedBy", "-password -secret")
    .populate("book")
    .populate("hashtag")
  

    const bookData = await Book.findById(post.book)


    let slowCount = await Review.countDocuments({$and:[ {book: post.book},{pacing: "Slow"}] });
    let mediumCount = await Review.countDocuments({$and:[ {book: post.book},{pacing: "Medium"}] });
    let fastCount = await Review.countDocuments({$and:[ {book: post.book},{pacing: "Fast"}] });

    const mostPacingCount = Math.max(slowCount,mediumCount,fastCount)
    const newPacing = mostPacingCount === slowCount? "Slow":mostPacingCount===mediumCount? "Medium": "Fast"

    const numberOfRating = bookData.numberOfRating
    // const newNumberOfRating = bookData.numberOfRating + 1
    
    const ratingAvg = ((bookData.rating*numberOfRating - post.rating + newPost.rating)/ numberOfRating).toFixed(2);
    const contentAvg = ((bookData.content*numberOfRating - post.content+ newPost.content)/ numberOfRating).toFixed(2);
    const developmentAvg = ((bookData.development*numberOfRating - post.development + newPost.development)/ numberOfRating).toFixed(2);
    const writingAvg = ((bookData.writing*numberOfRating - post.writing +  newPost.writing)/ numberOfRating).toFixed(2);
    const insightsAvg = ((bookData.insights*numberOfRating - post.insights + newPost.insights)/ numberOfRating).toFixed(2);

    const newBook = await Book.findByIdAndUpdate(post.book,{
      rating: ratingAvg,
      content: contentAvg,
      development: developmentAvg,
      pacing: newPacing,
      writing: writingAvg,
      insights: insightsAvg,
    });
    return res.status(200).json({ msg: "Updated review!", post: newPost });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const deleteOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Review.findByIdAndDelete(postId).populate("postedBy", "-password -secret")
    .populate("comments.postedBy", "-password -secret")
    .populate("book");;
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

    const bookData = await Book.findById(post.book._id)
    let slowCount = await Review.countDocuments({$and:[ {book: post.book._id},{pacing: "Slow"}] });
    let mediumCount = await Review.countDocuments({$and:[ {book: post.book._id},{pacing: "Medium"}] });
    let fastCount = await Review.countDocuments({$and:[ {book: post.book._id},{pacing: "Fast"}] });

    const mostPacingCount = Math.max(slowCount,mediumCount,fastCount)
    const newPacing = mostPacingCount === slowCount? "Slow":mostPacingCount==="Medium"? "Medium": "Fast"

    const numberOfRating = bookData.numberOfRating
    const newNumberOfRating = bookData.numberOfRating - 1
    if(newNumberOfRating!==0)
    {
      const ratingAvg = ((bookData.rating*numberOfRating - post.rating)/ newNumberOfRating).toFixed(2);
      const contentAvg = ((bookData.content*numberOfRating - post.content)/ newNumberOfRating).toFixed(2);
      const developmentAvg = ((bookData.development*numberOfRating - post.development)/ newNumberOfRating).toFixed(2);
      const writingAvg = ((bookData.writing*numberOfRating -post.writing)/ newNumberOfRating).toFixed(2);
      const insightsAvg = ((bookData.insights*numberOfRating -post.insights)/ newNumberOfRating).toFixed(2);
  
      const newBook = await Book.findByIdAndUpdate(post.book._id,{
        rating: ratingAvg,
        content: contentAvg,
        development: developmentAvg,
        pacing: newPacing,
        writing: writingAvg, 
        insights: insightsAvg,
        numberOfRating: newNumberOfRating
      });
    } else {
      const newBook = await Book.findByIdAndUpdate(post.book._id,{
        rating: 0,
        content: 0,
        development: 0,
        pacing: "",
        writing: 0, 
        insights: 0,
        numberOfRating: 0
      })
    }
    
    return res.status(200).json({ msg: "Deleted post!" });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

const like = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Review.findByIdAndUpdate(
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
      typeOfLink: "Review",
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
    const post = await Review.findByIdAndUpdate(
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
      typeOfLink: "Review",
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
    const post = await Review.findByIdAndUpdate(
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
    .populate("hashtag")


    const user = await User.findByIdAndUpdate(post.postedBy, {
      $inc: { points: 20 },
    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: "Review",
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
    const post = await Review.findByIdAndUpdate(
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
    .populate("hashtag")

    const user = await User.findByIdAndUpdate(post.postedBy, {
      $inc: { points: -20 },
    });

    const log = await Log.create({
      toUser: post.postedBy,
      fromUser: req.user.userId,
      linkTo: post._id,
      typeOfLink: "Review",
      type: 6,
      points: -20,
    });
    return res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const totalReviews = async (req, res) => {
  try {
    const totalPosts = await Review.find({}).estimatedDocumentCount();
    return res.status(200).json({ totalPosts });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
};

const getWithUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Review.find({ postedBy: { _id: userId } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
    .populate("hashtag")

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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    let { following } = user;
    following.push(req.user.userId);

    // pagination

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const posts = await Review.find({ postedBy: { $in: following } })
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
    .populate("hashtag")

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
    .populate("hashtag")


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

    const aggregated = await Review.aggregate([
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

    const posts = await Review.find({ _id: { $in: idsList } })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")
    .populate("hashtag")


    return res.status(200).json({ posts });
  } catch (e) {
    console.log(e);
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
    .populate("hashtag")


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


const report = async (req, res) => {
  try {
    const postId = req.body.postId;
    const post = await Review.findByIdAndUpdate(
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
    const post = await Review.findByIdAndUpdate(
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

const getAllReported = async (req, res) => {
  try {
    const posts = await Review.find({reported: true})
      .populate("postedBy", "-password -secret")
      .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(400).json({ msg: "No posts found!" });
    }
    const postsCount = await Review.find({}).estimatedDocumentCount();
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
  getPopular,
  getDiary,
  report,
  dismissReport,
  getAllReported
};
