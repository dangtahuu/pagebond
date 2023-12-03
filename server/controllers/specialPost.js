import specialPost from "../models/specialPost.js";
import SpecialPost from "../models/specialPost.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const createSpecialPost = async (req, res) => {
    const { text, image, title, type } = req.body;
    if (!text.length || !title.length) {
      return res.status(400).json({ msg: "Content and title are required!" });
    }
    try {
      const post = await SpecialPost.create({
        text,
        postedBy: req.user.userId,
        image,
        type,
        title
      });
  
      const postWithUser = await SpecialPost.findById(post._id).populate(
        "postedBy",
        "-password -secret"
      );
      return res.status(200).json({ post: postWithUser,  msg: "Create new post succesfully"  });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ msg: err });
    }
  };

  const allSpecialPosts = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.perPage) || 10;
      const posts = await SpecialPost.find({})
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

  const getSpecialPost = async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await specialPost.findById(postId)
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

  const editSpecialPost = async (req, res) => {
    try {
      const postId = req.params.id;
      const { text, image, title, type } = req.body;
      if (!text.length || !title.length) {
        return res.status(400).json({ msg: "Content and title are required!" });
      }
      const post = await SpecialPostost.findByIdAndUpdate(postId, {
       text, image, title
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


  const deleteSpecialPost = async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await SpecialPost.findByIdAndDelete(postId);
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

  const likeSpecialPost = async (req, res) => {
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
      return res.status(200).json({ post });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const unlikeSpecialPost = async (req, res) => {
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
      return res.status(200).json({ post });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };
  const addCommentToSpecialPost = async (req, res) => {
    try {
      const { postId, comment, image } = req.body;
      const post = await SpecialPost.findByIdAndUpdate(
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
  
  const removeCommentFromSpecialPost = async (req, res) => {
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
        .populate("comments.postedBy", "-password -secret");
  
      return res.status(200).json({ post });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };
  
  const totalSpecialPosts = async (req, res) => {
    try {
      const totalPosts = await SpecialPosts.find({}).estimatedDocumentCount();
      return res.status(200).json({ totalPosts });
    } catch (error) {
      return res.status(400).json({ msg: error });
    }
  };
  
  const getSpecialPostsWithUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
      const posts = await SpecialPost.find({ postedBy: { _id: userId } })
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
  
  const getDetailSpecialPost = async (req, res) => {
    try {
      const postId = req.params.postId;
      const post = await SpecialPost.findById(postId)
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

  const followingSpecialPosts = async (req, res) => {
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
        .sort({ createdAt: -1 })
        .limit(perPage);
      return res.status(200).json({ posts });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  export {createSpecialPost, allSpecialPosts, getSpecialPost}