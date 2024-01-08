import Log from "../models/log.js";
import User from "../models/user.js";

import LogType from "../models/logType.js";

const getNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const types = await LogType.find({
      name: {
        $in: [
          "comment",
          "follow",
          "send_points",
          "verify_news",
          "verify_account",
          "report_post",
          "report_account",
        ],
      },
    });

    const typeIds = types.map((one) => one._id);

    const unread = await Log.countDocuments({
      $and: [
        { toUser: req.user.userId },
        { type: { $in: typeIds } },
        { isDone: false },
      ],
    });

    const notifications = await Log.find({
      $and: [{ toUser: req.user.userId }, { type: { $in: typeIds } }],
    })
      .populate({
        path: "fromUser",
        model: "User",
        select: "-password -secret",
      })
      .populate("linkTo")
      .populate("type")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({ notifications, unread });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.body;
    const noti = await Log.findByIdAndUpdate(id, {
      isDone: true,
    });

    return res.status(200).json({ notification: noti });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const markReadAll = async (req, res) => {
  try {
    const types = await LogType.find({
      name: {
        $nin: ["redeem"],
      },
    });

    const typeIds = types.map((one) => one._id);

    const notis = await Log.updateMany(
      {
        $and: [{ toUser: req.user.userId }, { type: { $in: typeIds } }],
      },
      {
        isDone: true,
      }
    );

    return res.status(200).json({ notifications: notis });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getLogs = async (req, res) => {
  const { id } = req.params;
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 50;

    const logs = await Log.find({ toUser: id })
      .populate({
        path: "fromUser",
        model: "User",
        select: "-password -secret",
      })
      .populate({
        path: "toUser",
        model: "User",
        select: "-password -secret",
      })
      .populate("linkTo")
      .populate("type")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({ logs });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const markAsDone = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ msg: "Id is required" });

    const log = await Log.findByIdAndUpdate(
      id,
      { isDone: true },
      { new: true }
    );
    return res.status(200).json({ log });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getReport = async (req, res) => {
  const { id, type } = req.params;
  try {
    const name = type === "Post" ? "report_post" : "report_account";

    const logType = await LogType.findOne({ name });

    const logs = await Log.find({
      $and: [{ linkTo: id }, { typeOfLink: type }, { type: logType._id }],
    })
      .populate({
        path: "fromUser",
        model: "User",
        select: "-password -secret",
      })
      .populate({
        path: "toUser",
        model: "User",
        select: "-password -secret",
      })
      .populate("linkTo")
      .sort({ createdAt: -1 });

    return res.status(200).json({ logs });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

export {
  getNotifications,
  getLogs,
  markRead,
  markReadAll,
  markAsDone,
  getReport,
};
