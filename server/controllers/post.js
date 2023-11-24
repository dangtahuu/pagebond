import Post from "./../models/post.js";
import cloudinary from "cloudinary";
import User from "./../models/user.js";
import Book from "../models/book.js";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const createPost = async (req, res) => {
  const { content, rating, book, image, title, author, thumbnail, location, address, type } = req.body;

  if (!content.length) {
    return res.status(400).json({ msg: "Content is required!" });
  }

  if (type==4) {
    return res.status(400).json({ msg: "Only admin is allowed!" });
  }
  
  try {
    const post = await Post.create({
      content,
      postedBy: req.user.userId,
      image,
      rating,
      book,
      location, 
      address,
      type,
      
    });
    if (book) {
      const volume = await Book.findById(book)
      if (!volume) {
        await Book.create({
          _id:book,
          author,
          title,
          thumbnail,
          code:book
        })
      }
    }
    
    const postWithUser = await Post.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    );
    return res.status(200).json({ post: postWithUser, msg: "Create new post succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};


const createAdminPost = async (req, res) => {
  const { content, image, title } = req.body;
  if (!content.length || !title.length) {
    return res.status(400).json({ msg: "Content and title are required!" });
  }
  try {
    const post = await Post.create({
      content,
      postedBy: req.user.userId,
      image,
      type:4,
      title
    });

    const postWithUser = await Post.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    );
    return res.status(200).json({ post: postWithUser,  msg: "Create new post succesfully"  });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

// const createReview = async (req, res) => {
//   const { content, rating, book, image, title, author, thumbnail } = req.body;
//   if (!content.length) {
//     return res.status(400).json({ msg: "Content is required!" });
//   }
//   try {
//     const post = await Post.create({
//       content,
//       postedBy: req.user.userId,
//       image,
//       rating,
//       book,
//       type: 2,
//     });
//     console.log(book)
//     const volume = await Book.findById(book)
//     if (!volume) {
//       await Book.create({
//         _id:book,
//         author,
//         title,
//         thumbnail,
//         code:book
//       })
//     }
//     const postWithUser = await Post.findById(post._id).populate(
//       "postedBy",
//       "-password -secret"
//     );
//     return res.status(200).json({ post: postWithUser });
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({ msg: err });
//   }
// };

// const createExchange = async (req, res) => {
//   const { content, location, book, address, image } = req.body;
//   if (!content.length) {
//     return res.status(400).json({ msg: "Content is required!" });
//   }
//   // location.type="Point"
//   try {
//     const post = await Post.create({
//       content,
//       postedBy: req.user.userId,
//       image,
//       location,
//       address,
//       book,
//       type: 3,

//     });

//     const postWithUser = await Post.findById(post._id).populate(
//       "postedBy",
//       "-password -secret"
//     );
//     return res.status(200).json({ post: postWithUser });
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({ msg: err });
//   }
// };

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

const getAdminPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const posts = await Post.find({type:4})
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
    console.log(path);
    const result = await cloudinary.v2.uploader.upload(path);
    return res.status(200).json({
      url: result.url,
      public_id: result.public_id,
    });
    // return res.status(200).json({
    //     url: path,
    // });
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
const newsFeed = async (req, res) => {
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
    const perPage = Number(req.query.perPage) || 3;

    const posts = await Post.find({ postedBy: { $in: following } })
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

const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId
    // console.log(userId)
   

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 3;

    const posts = await Post.find({ $and:[ {book: id }, {type: 2}]})
      .skip((page - 1) * perPage)
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .sort({ createdAt: -1 })
      .limit(perPage);
    if (page === 1) {
      
      const postsCount = await Post.countDocuments({ $and:[ {book: id }, {type: 2}, { "rating" : { $ne: null } }]});

      if (postsCount > 0) {
      let result = 0;
        const allPosts = await Post.find({ $and:[ {book: id }, {type: 2}, { "rating" : { $ne: null } }]});
        allPosts.forEach((post) => {
          // if(post.rating)
          result += post.rating;
        });
        result = (result / postsCount).toFixed(1);
        console.log({ posts, postsCount, result })
      return res.status(200).json({ posts, postsCount, result });
      } 
      
    }
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getExchanges = async (req, res) => {
  try {
    const { id } = req.params;

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 3;

    const posts = await Post.find({ $and:[ {book: id }, {type: 3}]})
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


const getMyPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId

    const posts = await Post.find({ $and:[ {book: id }, {postedBy: userId}]})
      .populate("postedBy", "-password -secret")
      .populate("comments.postedBy", "-password -secret")
      .sort({ createdAt: -1 })
  
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, image, rating, location, address, title } = req.body;
    const post = await Post.findByIdAndUpdate(postId, {
      content,
      image,
      rating,
      location,
      address,
      title
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

const getPostWithUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ postedBy: { _id: userId } })
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

const getInformationPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
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
    
    const results = await Post.find({ $and:[{ 'location': {
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


export {
  createPost,
  allPosts,
  uploadImage,
  editPost,
  getPost,
  deletePost,
  newsFeed,
  likePost,
  unlikePost,
  addComment,
  removeComment,
  totalPosts,
  getPostWithUserId,
  getInformationPost,
  getReviews,
  getExchanges,
  getMyPosts,
  getNearby,
  createAdminPost,
  getAdminPosts
};
