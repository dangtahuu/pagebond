import express from "express";
import requireSignIn from "../middleware/authentication.js";
import isAdmin from "../middleware/isAdmin.js";
import {
    register,
    login,
    updateUser,
    currentUser,
    ForgotPassword,
    follow,
    unfollow,
    getFollowings,
    getFollowers,
    findPeopleToFollow,
    searchUser,
    getInformationUser,
    allUsers,
    deleteUserWithAdmin,
    findPeopleWithMostInteraction,
    getPopularUsers,
    reportUser,
  unblockUser,
  blockUser,
  allReported,
  allBlocked,
  verifyUser,
  allPending,
  giftPoints,
  createChallenge,
  makeFeatured,
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

router.route("/report").patch(requireSignIn, reportUser);
router.route("/block").patch(requireSignIn, isAdmin, blockUser);
router.route("/unblock").patch(requireSignIn, isAdmin, unblockUser);
router.route("/verify").patch(requireSignIn, isAdmin, verifyUser);

//admin
router.route("/current-admin").get(requireSignIn, isAdmin, currentUser);
router
    .route("/admin/delete-user/:id")
    .delete(requireSignIn, isAdmin, deleteUserWithAdmin);

router.route("/user-following/:id").get(requireSignIn, getFollowings);
router.route("/user-follower/:id").get(requireSignIn, getFollowers);

router.route("/find-people-to-follow").get(requireSignIn, findPeopleToFollow);
router.route("/find-people-most-interaction").get(requireSignIn, findPeopleWithMostInteraction);
router.route("/popular-users").get(requireSignIn, getPopularUsers);



router.route("/search").get(
    // requireSignIn, 
    searchUser);

router.route("/user-follow").put(requireSignIn, follow)
router.route("/user-unfollow").put(requireSignIn, unfollow);


router.route("/all").get(requireSignIn, isAdmin, allUsers);
router.route("/all-reported").get(requireSignIn, isAdmin, allReported);
router.route("/all-blocked").get(requireSignIn, isAdmin, allBlocked);
router.route("/all-pending").get(requireSignIn, isAdmin, allPending);



router.route("/:id").get(requireSignIn, getInformationUser);


router.route("/gift-points").put(requireSignIn, giftPoints);
router.route("/create-challenge").put(requireSignIn, createChallenge);

router.route("/feature").put(requireSignIn, makeFeatured);


export default router;
