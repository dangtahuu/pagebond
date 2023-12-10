import Log from "../models/log.js";
import User from "../models/user.js";
import Voucher from "../models/voucher.js";

const voucherTypes = {1: 10,2: 3000,3: 5000, 4: 1000, 5: 3000, 6: 5000}
const redeem = async (req, res) => {
  try {
    const { type } = req.body;
    const user = await User.findById(req.user.userId)
    if (user.points<voucherTypes[type]) 
    return res.status(400).json({ msg: "Not enough points" });

    const voucher = await Voucher.find({
      $and: [{ owner: null }, { type: type }],
    }).limit(1);
    if (!voucher)
      return res.status(400).json({ msg: "No voucher is available now!" });
    const edited = await Voucher.findByIdAndUpdate(
      voucher[0]._id,
      {
        owner: req.user.userId,
      },
      { new: true }
    );

    await User.findByIdAndUpdate(req.user.userId, {
        $inc: {points: voucherTypes[type]*-1}
    })

    const log = await Log.create({
        toUser: req.user.userId,
        fromUser: req.user.userId,
        typeOfLink: 'Voucher',
        type:8,
        points: voucherTypes[type],
    })

    return res.status(200).json({ voucher: edited, log });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const create = async (req, res) => {
  try {
    const { code, type } = req.body;
    const voucher = await Voucher.create({ code, type });
    console.log(voucher);
    return res.status(200).json({ voucher });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

export { create, redeem };
