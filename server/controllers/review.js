import Review from "../models/review.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const createReview = async (req, res) => {
   
  const { text, rating, book, image, title, content, development, pacing, writing, insights, dateRead} = req.body;

  if (!text || !rating || !title || ! content || !development || !pacing || !writing || !insights) {
    return res.status(400).json({ msg: "Please provide all required values" });
  }
  
  try {
    const post = await Review.create({
      text,
      postedBy: req.user.userId,
      image,
      rating,
      book,
    title,
    content,
    development,
    pacing,
    writing,
    insights,
    dateRead
      
    });

    
    const postWithUser = await Review.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    );
    return res.status(200).json({ post: postWithUser, msg: "Create new review succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
  };
  
  const allReviews = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.perPage) || 10;
      const posts = await Reviews.find({})
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


  const getReview = async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Review.findById(postId)
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        .populate("book")
      ;
      if (!post) {
        return res.status(400).json({ msg: "No post found!" });
      }
      return res.status(200).json({ post });
    } catch (error) {
      return res.status(400).json({ msg: error });
    }
  };

  const getReviews = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId
      // console.log(userId)
     
  
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.perPage) || 10;
  
      const posts = await Review.find( {book: id })
        .skip((page - 1) * perPage)
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        .sort({ createdAt: -1 })
        .limit(perPage);

      if (page === 1) {
        
        const postsCount = await Review.countDocuments({book:id });
  
        if (postsCount > 0) {
        let ratingSum, contentSum, developmentSum, pacingSum, writingSum, insightsSum = 0;
          const allPosts = await Review.find({book:id });
          allPosts.forEach((post) => {
            ratingSum += post.rating;
            contentSum += post.content;
            developmentSum += post.development;
            pacingSum += post.pacing;
            writingSum += post.writing;
            insightsSum += post.insights;


          });
          ratingAvg = (ratingSum / postsCount).toFixed(1);
          contentAvg = (contentSum / postsCount).toFixed(1);
          developmentAvg = (developmentSum / postsCount).toFixed(1);
          pacingAvg = (pacingSum / postsCount).toFixed(1);
          writingAvg = (writingSum / postsCount).toFixed(1);
          insightsAvg = (insightsSum / postsCount).toFixed(1);

    
          console.log({ posts, postsCount, result })
        return res.status(200).json({ posts, postsCount, ratingAvg, contentAvg, developmentAvg, pacingAvg, writingAvg, insightsAvg });
        } 
        
      }
      return res.status(200).json({ posts });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const getMyReviews = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId
  
      const posts = await Review.find({ $and:[ {book: id }, {postedBy: userId}]})
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        .sort({ createdAt: -1 })
    
      return res.status(200).json({ posts });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const editReview = async (req, res) => {
    try {
      const postId = req.params.id;
      const { text, rating, book, image, title, content, development, pacing, writing, insights, dateRead} = req.body;

      if (!text || !rating || !title || ! content || !development || !pacing || !writing || !insights) {
        return res.status(400).json({ msg: "Please provide all required values" });
      }

    
      const post = await Review.findByIdAndUpdate(postId, {
        text,
        image,
        rating,
      title,
      content,
      development,
      pacing,
      writing,
      insights,
      dateRead
      },  {
        new: true,
      });

      if (!post) {
        return res.status(400).json({ msg: "No review found!" });
      }
      return res.status(200).json({ msg: "Updated review!", post });
    } catch (error) {
      return res.status(400).json({ msg: error });
    }
  };

  const deleteReview = async (req, res) => {
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

  const likeReview = async (req, res) => {
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

  const unlikeReview = async (req, res) => {
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


  const addCommentToReview = async (req, res) => {
    try {
      const { postId, comment, image } = req.body;
      const post = await Review.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: {
              text: comment,
              postedBy: req.user.userId,
              image
            },
          },
        },
        {
          new: true,
        }
      )
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret");
  
      return res.status(200).json({  post });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };
  
  const removeCommentfromReview = async (req, res) => {
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
  
  const getReviewsWithUserId = async (req, res) => {
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
  
  const getDetailReview = async (req, res) => {
    try {
      const postId = req.params.postId;
      const post = await Review.findById(postId)
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        .populate("book")
        .sort({
          createdAt: -1,
        });
      return res.status(200).json({ post });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const followingReviews = async (req, res) => {
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

  export {createReview, allReviews, getReview}