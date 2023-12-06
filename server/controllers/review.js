import Review from "../models/review.js";
import cloudinary from "cloudinary";
import User from "../models/user.js";

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
    console.log("aaaa");
    return res.status(400).json({ msg: "Please provide all required values" });
  }

  try {
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
    });

    const postWithUser = await Review.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    );
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
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const posts = await Review.find({})
      .populate("postedBy", "-password -secret")
      .limit(perPage)
      .skip((page - 1) * perPage)
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

const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Review.findById(postId)
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
    const userId = req.user.userId;
    // console.log(userId)

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const posts = await Review.find({ book: id })
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

    const posts = await Review.find({
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
      },
      {
        new: true,
      }
    );

    if (!post) {
      return res.status(400).json({ msg: "No review found!" });
    }
    return res.status(200).json({ msg: "Updated review!", post });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const deleteOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Review.findByIdAndDelete(postId);
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
    const post = await Review.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: req.user.userId },
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
      .populate("comments.postedBy", "-password -secret");

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
      .populate("comments.postedBy", "-password -secret");

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
    console.log(suggestion)
    let peopleList;

    if (suggestion.length > 0) {
      if (shuffledFollowing.length > 0)
        peopleList = [...suggestion, ...shuffledFollowing.splice(0, 10)];
      else peopleList = [...suggesion];
    } else return res.status(200).json({ msg: "No suggestion at the moment", reviews:[] });

    let result = [];

    for (const one of peopleList) {
      const randomPostId = await Review.aggregate([
        {
          $match: {
            $and: [
              {
                $and: [
                  { likes: { $nin: [userId] } },
                  {
                    comments: { $not: { $elemMatch: { postedBy: user._id } } },
                  },
                ],
              },
              { postedBy: one },
            ],
          },
        },
        { $sample: { size: 1 } },
        { $project: { _id: 1 } }, // Project only the _id field for the next step
      ]);

      const post = await Review.findById(randomPostId)
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        .populate("book");
      if(post) result.push(post);
    }

    return res.status(200).json({ reviews: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getRandomReadBooks = async(req,res) => {
  try {
    const limit = req.query.limit || 5
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
  
    const posts = await Review.find({ $and: [{postedBy: userId},{rating: {$gt: 3}}]  })
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .populate("book")

      const uniqueBookIds = new Set();
    
      for (const obj of posts) {
        if (!uniqueBookIds.has(obj.book)) {
          uniqueBookIds.add(obj.book);
        }
      }

      const shuffledBookIds = shuffle(uniqueBookIds)

    return res.status(200).json({ bookIds: shuffledBookIds.splice(0,5) });
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
};
