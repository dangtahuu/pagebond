import express from "express";
import requireSignIn from "../middleware/authentication.js";
import isAdmin from "../middleware/isAdmin.js";
import {
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
    findPeopleWithMostInteraction
} from "./../controllers/auth.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({ msg: "Auth" });
});

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot-password").post(ForgotPassword);

// user
router.route("/current-user").get(requireSignIn, currentUser);
router.route("/update-user").patch(requireSignIn, updateUser);

//admin
router.route("/current-admin").get(requireSignIn, isAdmin, currentUser);
router
    .route("/admin/delete-user/:id")
    .delete(requireSignIn, isAdmin, deleteUserWithAdmin);

router.route("/user-following/:id").get(requireSignIn, userFollowing);
router.route("/user-follower/:id").get(requireSignIn, listUserFollower);

router.route("/find-people-to-follow").get(requireSignIn, findPeopleToFollow);
router.route("/find-people-most-interaction").get(requireSignIn, findPeopleWithMostInteraction);


router.route("/search-user").get(
    // requireSignIn, 
    searchUser);

router.route("/user-follow").put(requireSignIn, addFollower, userFollower);

router.route("/all-users").get(requireSignIn, isAdmin, allUsers);

router.route("/:id").get(requireSignIn, getInformationUser);

router.route("/user-unfollow").put(requireSignIn, removeFollower, userUnFollower);

export default router;
