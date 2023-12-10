import Log from "../models/log.js";
import User from "../models/user.js";

const getNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;

    const unread = await Log.find({
        $and: [
          { toUser: req.user.userId },
          { type: { $in: [1, 3, 5, 7, 8, 9] } },
          { isRead: false}
        ],
      }).estimatedDocumentCount()
      

    const notifications = await Log.find({
      $and: [
        { toUser: req.user.userId },
        { type: { $in: [1, 3, 5, 7, 8, 9] } },
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
    console.log(reviewDetailLogs.length)

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

    let allNoti = [
      ...userLogs,
      ...postDetailLogs,
      ...reviewDetailLogs,
      ...tradeDetailLogs,
      ...specialPostDetailLogs,
    ];

    console.log(allNoti.length)
    allNoti.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ notifications: allNoti, unread });
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

export { getNotifications, getLogs };
