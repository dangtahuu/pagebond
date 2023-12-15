import Log from "../models/log.js";
import User from "../models/user.js";

const getNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const unread = await Log.find({
        $and: [
          { toUser: req.user.userId },
          { type: { $in: [1, 5, 7, 8, 9] } },
          { isRead: false}
        ],
      })

    const unreadCount = unread.length
      

    const notifications = await Log.find({
      $and: [
        { toUser: req.user.userId },
        { type: { $in: [1, 5, 7, 8, 9] } },
      ],
    })
      .populate({
        path: "fromUser",
        model: "User",
        select: "-password -secret",
      })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 });

    const userLogs = notifications.filter((one) => one.typeOfLink === "User");

    const postLogs = notifications.filter((one) => one.typeOfLink === "Post");

    const postDetailLogs = await Log.populate(postLogs, {
      path: "linkTo",
      model: "Post",
    });

    console.log(postDetailLogs.length)
    const reviewLogs = notifications.filter(
      (one) => one.typeOfLink == "Review"
    
    );

    const reviewDetailLogs = await Log.populate(reviewLogs, {
      path: "linkTo",
      model: "Review",
    });

    const tradeLogs = notifications.filter((one) => one.typeOfLink === "Trade");

    const tradeDetailLogs = await Log.populate(tradeLogs, {
      path: "linkTo",
      model: "Trade",
    });

    
    const specialPostLogs = notifications.filter(
      (one) => one.typeOfLink === "SpecialPost"
    );

    const specialPostDetailLogs = await Log.populate(specialPostLogs, {
      path: "linkTo",
      model: "SpecialPost",
    });

    const questionLogs = notifications.filter(
      (one) => one.typeOfLink === "Question"
    );

    const questionDetailLogs = await Log.populate(questionLogs, {
      path: "linkTo",
      model: "Question",
    });

    let allNoti = [
      ...userLogs,
      ...postDetailLogs,
      ...reviewDetailLogs,
      ...tradeDetailLogs,
      ...specialPostDetailLogs,
      ...questionDetailLogs
    ];

    allNoti.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ notifications: allNoti, unread: unreadCount });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};



const markRead = async (req, res) => {
  try {
    const {id} = req.body
    const noti = await Log.findByIdAndUpdate(id,{
        isRead: true
      })

    return res.status(200).json({ notification: noti });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const markReadAll = async (req, res) => {
  try {
    const notis = await Log.updateMany({
        $and: [
          { toUser: req.user.userId },
          { type: { $in: [1, 5, 7, 8, 9] } },
          { isRead: false}
        ],
      },{
        isRead: true
      })

    return res.status(200).json({ notifications: notis });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getLogs = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.perPage) || 50;
  
      const logs = await Log.find({
         $and: [ { toUser: req.user.userId },
          { type: { $nin: [8, 9] } },
        ],
      })
        .populate({
          path: "fromUser",
          model: "User",
          select: "-password -secret",
        })
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ createdAt: -1 });
  
      const userLogs = logs.filter((one) => one.typeOfLink === "User");
  
      const postLogs = logs.filter((one) => one.typeOfLink === "Post");
  
      const postDetailLogs = await Log.populate(postLogs, {
        path: "linkTo",
        model: "Post",
      });
  
      const reviewLogs = logs.filter(
        (one) => one.typeOfLink == "Review"
      
      );
  
      const reviewDetailLogs = await Log.populate(reviewLogs, {
        path: "linkTo",
        model: "Review",
      });
  
      const tradeLogs = logs.filter((one) => one.typeOfLink === "Trade");
  
      const tradeDetailLogs = await Log.populate(tradeLogs, {
        path: "linkTo",
        model: "Trade",
      });
  
      
      const specialPostLogs = logs.filter(
        (one) => one.typeOfLink === "SpecialPost"
      );
  
      const specialPostDetailLogs = await Log.populate(specialPostLogs, {
        path: "linkTo",
        model: "SpecialPost",
      });
  
      let allLogs = [
        ...userLogs,
        ...postDetailLogs,
        ...reviewDetailLogs,
        ...tradeDetailLogs,
        ...specialPostDetailLogs,
      ];
  
      allLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      return res.status(200).json({ logs: allLogs });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ msg: err });
    }
  };

export { getNotifications, getLogs, markRead, markReadAll };
