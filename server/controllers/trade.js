import Trade from "../models/trade.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const createTrade = async (req, res) => {
  const { text, book, image, location, address, condition } = req.body;

  if (!text || !address || !location || !condition) {
    return res.status(400).json({ msg: "Please provide all required values" });
  }

  try {
    const post = await Trade.create({
      text,
      postedBy: req.user.userId,
      image,
      location,
      book,
      address,
      condition,
    });

    const postWithUser = await Trade.findById(post._id).populate(
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

const allTrades = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.perPage) || 10;
      const posts = await Trade.find({})
        .populate("postedBy", "-password -secret")
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ createdAt: -1 });
      if (!posts) {
        return res.status(400).json({ msg: "No trade posts found!" });
      }
      const postsCount = await Post.find({}).estimatedDocumentCount();
      return res.status(200).json({ posts, postsCount });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const getTrade = async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Trade.findById(postId)
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

  const getTrades = async (req, res) => {
    try {
      const { id } = req.params;
  
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.perPage) || 10;
  
      const posts = await Trade.find({book:id})
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

  const getMyTrades = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId
  
      const posts = await Trade.find({ $and:[ {book: id }, {postedBy: userId}]})
        .populate("postedBy", "-password -secret")
        .populate("comments.postedBy", "-password -secret")
        .sort({ createdAt: -1 })
    
      return res.status(200).json({ posts });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const editTrade = async (req, res) => {
    try {
      const postId = req.params.id;
      const { text, book, image, location, address, condition } = req.body;

      if (!text || !address || !location || !condition) {
        return res.status(400).json({ msg: "Please provide all required values" });
      }

      const post = await Trade.findByIdAndUpdate(postId, {
       text, image, location, address, condition
      },  {
        new: true,
      });
      if (!post) {
        return res.status(400).json({ msg: "No post found!" });
      }
      return res.status(200).json({ msg: "Updated posts!", post });
    } catch (error) {
      return res.status(400).json({ msg: error });
    }
  };

  const deleteTrade = async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Trade.findByIdAndDelete(postId);
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

  const likeTrade = async (req, res) => {
    try {
      const postId = req.body.postId;
      const post = await Trade.findByIdAndUpdate(
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
  const unlikeTrade = async (req, res) => {
    try {
      const postId = req.body.postId;
      const post = await Trade.findByIdAndUpdate(
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

  const addCommentToTrade = async (req, res) => {
    try {
      const { postId, comment, image } = req.body;
      const post = await Trade.findByIdAndUpdate(
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
  
  const removeCommentFromTrade = async (req, res) => {
    try {
      const { postId, commentId } = req.body;
      const post = await Trade.findByIdAndUpdate(
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
  
  const totalTrades = async (req, res) => {
    try {
      const totalPosts = await Trade.find({}).estimatedDocumentCount();
      return res.status(200).json({ totalPosts });
    } catch (error) {
      return res.status(400).json({ msg: error });
    }
  };
  
  const getTradesWithUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
      const posts = await Trade.find({ postedBy: { _id: userId } })
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
  
  const getDetailTrade = async (req, res) => {
    try {
      const postId = req.params.postId;
      const post = await Trade.findById(postId)
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

  const getNearby = async (req, res) => {
    const { long, lat, item } = req.params
    try {
      
      const results = await Trade.find({ $and:[{ 'location': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [long, lat]
          },
          $maxDistance: 10000,
        }
      }
      },{'postedBy':{$ne: req.user.userId}}]}
       )
        .populate("postedBy", "-password -secret -email -username -following -follower -role -about")
        .populate("book")
        .limit(item)
      return res.status(200).json({ results });
    } catch (error) {
      return res.status(400).json({ msg: error });
    }
  };

  const followingTrades = async (req, res) => {
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

export { createTrade, allTrades, getTrade};
