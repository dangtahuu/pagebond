import Log from "../models/log.js";
import User from "../models/user.js";
import Voucher from "../models/voucher.js";



const create = async (req, res) => {
  try {
    const { code, name, description, points } = req.body;

    const array = code.split(",").map((item) => {
      return item.trim();
    });

    const voucher = await Voucher.create({
      code: array,
      name,
      description,
      points,
    });
    return res.status(200).json({ voucher });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const edit = async (req, res) => {
  try {
    const { voucherId, code, name, description, points } = req.body;

    const array = code.split(",").map((item) => {
      return item.trim();
    });

    console.log('points')
    const voucher = await Voucher.findByIdAndUpdate(voucherId, {
      code: array,
      name,
      description,
      points,
    });
    return res.status(200).json({ voucher });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id: voucherId } = req.params;

    const voucher = await Voucher.findByIdAndDelete(voucherId)
    if (!voucher) return res.status(200).json({ msg: "No voucher found!" })
    return res.status(200).json({ voucher });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getOne = async (req, res) => {
  try {
    const { id: voucherId } = req.params;

    const voucher = await Voucher.findById(voucherId)
    if (!voucher) return res.status(200).json({ msg: "No voucher found!" })
    return res.status(200).json({ voucher });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAllRemaining = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ code: { $ne: [] } });
    return res.status(200).json({ vouchers });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const getAll = async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ vouchers });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const redeem = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(req.user.userId);
    const voucher = await Voucher.findById(id);

    if (!voucher) return res.status(400).json({ msg: "No voucher is found!" });
    console.log(user.points);
    console.log(voucher.points);
    if (user.points < voucher.points)
      return res.status(400).json({ msg: "Not enough points" });

    if (voucher.code.length === 0)
      return res.status(400).json({ msg: "No code is left for this voucher" });

    const editedVoucher = await Voucher.findByIdAndUpdate(id, {
      $pop: { code: -1 },
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { points: voucher.points * -1 },
    });

    const log = await Log.create({
      toUser: req.user.userId,
      fromUser: req.user.userId,
      typeOfLink: "Voucher",
      linkTo: id,
      type: 9,
      points: voucher.points * -1,
      note: voucher.code[0],
    });

    return res.status(200).json({ voucher: editedVoucher, log });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

export { create, edit, deleteOne, getOne, getAll, getAllRemaining, redeem };
