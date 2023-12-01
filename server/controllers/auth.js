import User from "./../models/user.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
const newFormat = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

const register = async (req, res) => {
   try {
    const { name, email, password, rePassword, secret } = req.body;

    if (!name || !email || !password || !secret || !rePassword) {
        return res.status(400).json({ msg: "Please provide all values!" });
    }
    if (name.length < 3 || name.length > 20) {
        return res
            .status(400)
            .json({
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
        url: '/images/avatar.png',
        public_id: nanoid(),
    };
    
    await User.create({
        name,
        email,
        password,
        secret,
        image,
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
            return res
                .status(400)
                .json({ msg: "Please provide a valid email!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ msg: "Incorrect information!" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ msg: "Incorrect information!" });
        }

     
        const token = jwt.sign({ _id: user._id }, process.env.JWT, {
            expiresIn: '365d',

        });
        return res.status(200).json({ token, user });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: "LOGIN ERROR. Try again!" });
    }
};

const currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        return res.status(200).json({ user, ok: true });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: "Error. Try again!" });
    }
};

const updateUser = async (req, res) => {
    try {
        const {
            name,
            about,
            image,
            password,
            rePassword,
            currentPassword,
        } = req.body;
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
                return res
                    .status(400)
                    .json({ msg: "New passwords are not the same!" });
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
            expiresIn: process.env.JWT_LIFETIME || "1d",
        });
        return res.status(200).json({ msg: "Update user successfully!", user, token });
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
            return res
                .status(400)
                .json({ msg: "Please provide a valid email!" });
        }
        const user = await User.findOne({ email, secret });
        if (!user) {
            return res
                .status(400)
                .json({ msg: "Email or secret is not defined!" });
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
        res.status(200).json({ msg: "Unfollowed!", user });
    } catch (error) {
        return res.status(400).json({ msg: "Something went wrong. Try again!" });
    }
};

const findPeople = async (req, res) => {
    try {
        // current user
        const user = await User.findById(req.user.userId);
        // array user following

        if (!user) {
            return res.status(400).json({ msg: "No user found!" });
        }
        let following = user.following;
        // ,
        // "_id image name username"
        const people = await User.find({ _id: { $nin: following } })
            .select(
                "-password -secret -email -following -follower -createdAt -updatedAt"
            )
            .limit(10);

        return res.status(200).json({ msg: "Find successfully", people });
    } catch (error) {
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
    const term = req.query.term;
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;

    if (!term.length) {
        return res.status(400).json({ msg: "Search term is required!" });
      }

    try {
        const users = await User.find({
            $or: [{ name: { $regex: term, $options: "i" } }],
        }).select(
            "-password -secret -email -following -follower -createdAt -updatedAt"
        )
        .limit(perPage)
        .skip((page - 1) * perPage)

        if (!users) {
            return res.status(400).json({ msg: "No result found!" });
          }
  
        return res.status(200).json({ users, perPage });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: error });
    }
};

const getInformationUser = async (req, res) => {
    try {
        const _id = req.params.id;
        const user = await User.findById(_id).select("-password -secret");
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
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;
        const users = await User.find({})
            .select("-password -secret")
            .skip((page - 1) * perPage)
            .sort({ createdAt: -1 })
            .limit(perPage);
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


export {
    register,
    login,
    updateUser,
    currentUser,
    ForgotPassword,
    addFollower,
    userFollower,
    findPeople,
    userFollowing,
    removeFollower,
    userUnFollower,
    searchUser,
    getInformationUser,
    allUsers,
    deleteUserWithAdmin,
    listUserFollower,
};
