import User from "./../models/user.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import { nanoid, random } from "nanoid";
const newFormat = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
import Post from "../models/post.js";
import Review from "../models/review.js";
import SpecialPost from "../models/specialPost.js";
import Trade from "../models/trade.js";
import shuffle from "../utils/shuffle.js";
import sortObjectDes from "../utils/sortObjectDes.js";
import Log from "../models/log.js";
const register = async (req, res) => {
  try {
    const { name, email, password, rePassword, secret, official } = req.body;

    if (!name || !email || !password || !secret || !rePassword) {
      return res.status(400).json({ msg: "Please provide all values!" });
    }
    if (name.length < 3 || name.length > 20) {
      return res.status(400).json({
        msg: "Name must be longer than 3 characters and shorter 20 characters",
      });
    }

    if (newFormat.test(name)) {
      return res
        .status(400)
        .json({ msg: "Name cannot have special characters!" });
    }
    if (password !== rePassword) {
      return res.status(400).json({ msg: "Passwords are not the same!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be longer than 6 characters!" });
    }
    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return res.status(400).json({ msg: "Please provide a valid email!" });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      //throw new BadRequest('Email is taken!');
      return res.status(400).json({ msg: "Email is taken!" });
    }
    const image = {
      url: "/images/avatar.png",
      public_id: nanoid(),
    };

    await User.create({
      name,
      email,
      password,
      secret,
      image,
      role: official ? 0 : 3,
    });

    return res.status(200).json({
      msg: "Register successfully. Let's login!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "REGISTER ERROR. Try again!" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide all values!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be longer than 6 characters!" });
    }

    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return res.status(400).json({ msg: "Please provide a valid email!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Incorrect information!" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect information!" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT, {
      expiresIn: "365d",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "LOGIN ERROR. Try again!" });
  }
};

const currentUser = async (req, res) => {
  try {
    console.log('nnnnnnnnn')
    const user = await User.findById(req.user.userId)
    .populate({
      path: "featuredShelf",
      populate: {
        path: "books"
      }
    })
    console.log(user)
    return res.status(200).json({ user, ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Error. Try again!" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, about, image, password, rePassword, currentPassword } =
      req.body;
    const userId = req.user.userId;
    let data = { name };
    if (!name) {
      return res.status(400).json({ msg: "Please provide a name!" });
    }
    if (newFormat.test(name)) {
      return res
        .status(400)
        .json({ msg: "Name cannot have special characters" });
    }
    if (about) {
      data.about = about;
    }
    if (image) {
      data.image = image;
    }
    if (currentPassword) {
      if (password !== rePassword) {
        return res.status(400).json({ msg: "New passwords are not the same!" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be longer than 6 characters!" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ msg: "No user found" });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ msg: "Current password is wrong! Try again!" });
      }
    }

    let user = await User.findByIdAndUpdate(req.user.userId, data, {
      new: true,
    });
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    if (currentPassword) {
      user.password = password;
      await user.save();
    }
    user.password = undefined;
    user.secret = undefined;
    const token = jwt.sign({ _id: user._id }, process.env.JWT, {
      expiresIn: "365d",
    });
    return res
      .status(200)
      .json({ msg: "Update user successfully!", user, token });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "UPDATE ERROR. Try again!" });
  }
};

const ForgotPassword = async (req, res) => {
  try {
    const { email, newPassword, rePassword, secret } = req.body;
    if (!email || !newPassword || !rePassword || !secret) {
      return res.status(400).json({ msg: "Please provide all values!" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be longer than 6 characters!" });
    }
    if (newPassword !== rePassword) {
      return res.status(400).json({ msg: "Passwords are not the same!" });
    }
    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return res.status(400).json({ msg: "Please provide a valid email!" });
    }
    const user = await User.findOne({ email, secret });
    if (!user) {
      return res.status(400).json({ msg: "Email or secret is not defined!" });
    }

    user.password = newPassword;
    user.save();
    return res.status(200).json({ msg: "Change password successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const addFollower = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      $addToSet: {
        follower: req.user.userId,
      },
      $inc: { points: 50 },
    });

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }

    next();
  } catch (error) {
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const userFollower = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $addToSet: { following: req.body.userId },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }

    const log = await Log.create({
      toUser: req.body.userId,
      fromUser: req.user.userId,
      linkTo: req.user.userId,
      typeOfLink: "User",
      type: 1,
      points: 50,
    });

    res.status(200).json({ msg: "Follow successfully!", user });
  } catch (error) {
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const removeFollower = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      $pull: {
        follower: req.user.userId,
      },
      $inc: { points: -50 },
    });
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    next();
  } catch (error) {
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const userUnFollower = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $pull: { following: req.body.userId },
      },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }

    const log = await Log.create({
      toUser: req.body.userId,
      fromUser: req.user.userId,
      linkTo: req.user.userId,
      typeOfLink: "User",
      type: 2,
      points: -50,
    });
    res.status(200).json({ msg: "Unfollowed!", user });
  } catch (error) {
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const findPeopleToFollow = async (req, res) => {
  try {
    // current user
    const user = await User.findById(req.user.userId);
    // array user following

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }

    const posts = await Post.find({
      $and: [
        {
          $or: [
            { likes: { $in: [user._id] } },
            { comments: { $elemMatch: { postedBy: user._id } } },
          ],
        },
        { postedBy: { $nin: user.following } },
        { postedBy: { $ne: user._id } },
      ],
    });

    const reviews = await Review.find({
      $and: [
        {
          $or: [
            { likes: { $in: [user._id] } },
            { comments: { $elemMatch: { postedBy: user._id } } },
          ],
        },
        { postedBy: { $nin: user.following } },
        { postedBy: { $ne: user._id } },
      ],
    });

    const trades = await Trade.find({
      $and: [
        {
          $or: [
            { likes: { $in: [user._id] } },
            { comments: { $elemMatch: { postedBy: user._id } } },
          ],
        },
        { postedBy: { $nin: user.following } },
        { postedBy: { $ne: user._id } },
      ],
    });

    const specialPosts = await SpecialPost.find({
      $and: [
        {
          $or: [
            { likes: { $in: [user._id] } },
            { comments: { $elemMatch: { postedBy: user._id } } },
          ],
        },
        { postedBy: { $nin: user.following } },
        { postedBy: { $ne: user._id } },

        { type: 2 },
      ],
    });

    const totalPosts = [...posts, ...reviews, ...trades, ...specialPosts];
    const idsCount = {};

    posts.forEach((post) => {
      idsCount[post.postedBy] = (idsCount[post.postedBy] || 0) + 1;
    });

    const sortedIds = Object.keys(idsCount).sort(
      (a, b) => idsCount[b] - idsCount[a]
    );

    const fist50People = sortedIds.slice(0, 10);

    const randomPeople = shuffle(fist50People);

    const idsList = randomPeople.slice(0, 5);

    const people = await User.find({ _id: { $in: idsList } }).select(
      "-password -secret -email -following -follower -createdAt -updatedAt"
    );

    return res.status(200).json({ people, idsList });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const findPeopleWithMostInteraction = async (req, res) => {
  try {
    // current user
    const user = await User.findById(req.user.userId);
    // array user following

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }

    const posts = await Post.find({
      $or: [
        { likes: { $in: [user._id] } },
        { comments: { $elemMatch: { postedBy: user._id } } },
      ],
    });

    const reviews = await Review.find({
      $or: [
        { likes: { $in: [user._id] } },
        { comments: { $elemMatch: { postedBy: user._id } } },
      ],
    });
    const trades = await Trade.find({
      $or: [
        { likes: { $in: [user._id] } },
        { comments: { $elemMatch: { postedBy: user._id } } },
      ],
    });

    const specialPosts = await SpecialPost.find({
      $or: [
        { likes: { $in: [user._id] } },
        { comments: { $elemMatch: { postedBy: user._id } } },
      ],
    });

    const totalPosts = [...posts, ...reviews, ...trades, ...specialPosts];
    const idsCount = {};

    posts.forEach((post) => {
      idsCount[post.postedBy] = (idsCount[post.postedBy] || 0) + 1;
    });

    const sortedIds = Object.keys(idsCount).sort(
      (a, b) => idsCount[b] - idsCount[a]
    );

    const idsList = sortedIds.slice(0, 50);

    const people = await User.find({ _id: { $in: idsList } }).select(
      "-password -secret -email -following -follower -createdAt -updatedAt"
    );

    return res.status(200).json({ people, idsList });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const userFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    // current user
    const user = await User.findById(userId);
    // array user following
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    let following = user.following;
    //following.filter((f) => new mongoose.Types.ObjectId(f));

    const people = await User.find({ _id: { $in: following } })
      .select(
        "-password -secret -email -following -follower -createdAt -updatedAt"
      )
      .limit(100);
    return res
      .status(200)
      .json({ msg: "Find success", following: people, name: user.name });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};
const listUserFollower = async (req, res) => {
  try {
    const userId = req.params.id;
    // current user
    const user = await User.findById(userId);
    // array user follower
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    let follower = user.follower;
    //follower.filter((f) => new mongoose.Types.ObjectId(f));

    const people = await User.find({ _id: { $in: follower } })
      .select(
        "-password -secret -email -following -follower -createdAt -updatedAt"
      )
      .limit(100);
    return res
      .status(200)
      .json({ msg: "Find success", follower: people, name: user.name });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const searchUser = async (req, res) => {
  const term = JSON.parse(decodeURIComponent(req.query.term))
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 20;

  if (!term.length) {
    return res.status(400).json({ msg: "Search term is required!" });
  }

  const regexPattern = term
  .split(" ")
  .map((word) => `(?=.*\\b${word}\\b)`)
  .join("");

const regex = new RegExp(regexPattern, "i");

  try {
    const users = await User.find({
      $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }],
    })
      .select(
        "-password -secret -email -following -follower -createdAt -updatedAt"
      )
      .limit(perPage)
      .skip((page - 1) * perPage);

    if (!users) {
      return res.status(400).json({ msg: "No result found!" });
    }

    return res.status(200).json({ results: users, perPage });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getInformationUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(_id).select("-password -secret")
    .populate({
      path: "featuredShelf",
      populate: {
        path: "books"
      }
    });
    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const allUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password -secret")
      .sort({ createdAt: -1 });
    if (!users) {
      return res.status(400).json({ msg: "No user found!" });
    }
    const numberUsers = await User.find({}).estimatedDocumentCount();
    return res.status(200).json({ users, numberUsers });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const allPending = async (req, res) => {
  try {
    const users = await User.find({ role: 0 })
      .select("-password -secret")
      .sort({ createdAt: -1 });
    if (!users) {
      return res.status(400).json({ msg: "No user found!" });
    }
    const numberUsers = await User.find({}).estimatedDocumentCount();
    return res.status(200).json({ users, numberUsers });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const allReported = async (req, res) => {
  try {
    const users = await User.find({ blocked: "Reported" })
      .select("-password -secret")
      .sort({ createdAt: -1 });
    if (!users) {
      return res.status(400).json({ msg: "No user found!" });
    }
    const numberUsers = await User.find({}).estimatedDocumentCount();
    return res.status(200).json({ users, numberUsers });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const allBlocked = async (req, res) => {
  try {
    const users = await User.find({ blocked: "Blocked" })
      .select("-password -secret")
      .sort({ createdAt: -1 });
    if (!users) {
      return res.status(400).json({ msg: "No user found!" });
    }
    const numberUsers = await User.find({}).estimatedDocumentCount();
    return res.status(200).json({ users, numberUsers });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const deleteUserWithAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(400).json({ msg: "No user found." });
    }
    return res.status(200).json({ msg: "Deleted user." });
  } catch (error) {
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const getPopularUsers = async (req, res) => {
  try {
    const limit = req.query.limit;

    let allData;
    if (limit && limit != -1) {
      const today = new Date();
      const daysAgo = new Date(today);
      daysAgo.setDate(today.getDate() - limit);
      const posts = await Post.find({ createdAt: { $gt: daysAgo } });
      const reviews = await Review.find({ createdAt: { $gt: daysAgo } });
      const trades = await Trade.find({ createdAt: { $gt: daysAgo } });
      allData = [...posts, ...reviews, ...trades];
    } else {
      const posts = await Post.find({});
      const reviews = await Review.find({});
      const trades = await Trade.find({});
      allData = [...posts, ...reviews, ...trades];
    }

    const users = {};
    for (const post of allData) {
      users[post.postedBy] =
        (users[post.postedBy] || 0) +
        (post.likes.length + post.comments.length);
    }

    const sortedUsers = sortObjectDes(users);

    const topUsers = Object.fromEntries(
      Object.entries(sortedUsers).slice(0, 20)
    );

    const topUsersIds = Object.keys(topUsers);

    const people = [];
    for (const id of topUsersIds) {
      const detailedTopUsers = await User.find({
        _id: id,
      }).select(
        "-password -secret -email -following -follower -createdAt -updatedAt"
      );
      people.push(...detailedTopUsers);
    }

    return res.status(200).json({ people });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const reportUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      blocked: "Reported",
    });

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      blocked: "Blocked",
    });

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      blocked: "Clean",
    });

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      role: 2,
    });

    if (!user) {
      return res.status(400).json({ msg: "No user found!" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

const giftPoints = async (req, res) => {
  const { giftedId} = req.body
  const points = Number(req.body.points)
  const userId = req.user.userId;

  try {

    let giftedUser = await User.findById(giftedId);

    if(!giftedUser) return res.status(400).json({ msg: "No gifted user found!" });


    let currentUser = await User.findById(userId);

    if(!currentUser) return res.status(400).json({ msg: "No user found!" });
    if(currentUser.points<points) return res.status(400).json({ msg: "Not enough points" });

    currentUser = await User.findByIdAndUpdate(userId,{
      $inc: {points: points*(-1)}
    });

    giftedUser = await User.findByIdAndUpdate(giftedId,{
      $inc: {points: points}
    });

    await Log.create({
      toUser: giftedId,
      fromUser: userId,
      linkTo: userId,
      typeOfLink: "User",
      type: 7,
      points: points,
    });

    await Log.create({
      toUser: userId,
      fromUser: userId,
      linkTo: giftedId,
      typeOfLink: "User",
      type: 8,
      points: points*(-1),
    });


    return res.status(200).json({ msg: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong. Try again!" });
  }
};

export {
  register,
  login,
  updateUser,
  currentUser,
  ForgotPassword,
  addFollower,
  userFollower,
  findPeopleToFollow,
  userFollowing,
  removeFollower,
  userUnFollower,
  searchUser,
  getInformationUser,
  allUsers,
  deleteUserWithAdmin,
  listUserFollower,
  findPeopleWithMostInteraction,
  getPopularUsers,
  reportUser,
  unblockUser,
  allReported,
  allBlocked,
  blockUser,
  verifyUser,
  allPending,
  giftPoints
};
