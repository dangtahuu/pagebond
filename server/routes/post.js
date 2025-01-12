import express from "express";

import {
    createPost,
    getAll,
    getAllReported,
    uploadImage,
    editPost,
    getPost,
    deletePost,
    getFollowing,
    likePost,
    unlikePost,
    addComment,
    removeComment,
    totalPosts,
    getPostsWithUserId,
    getDiscover,
    getPopular,
    report,
    dismissReport,
    search,
    getPostsWithUserIdWithBook,
    getNumberOfPostsWithUserId,
    getStats,
    savePost,
    unsavePost,
    getSavedPosts

} from "../controllers/post.js";
import formidable from "express-formidable";
import {canUpdateOrDeletePost} from "../middleware/canUpdateOrDelete.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
    res.json({msg: "Post"});
});

router.route("/create").post(createPost);
router.route("/all").get(isAdmin, getAll);
router.route("/all-reported").get(isAdmin, getAllReported);
router.route("/search").get(search);


// router.route("/create-adminpost").post(isAdmin, createAdminPost);

router.route("/following").get(getFollowing);
router.route("/popular").get(getPopular);

router.route("/discover").post(getDiscover);

// router.route("/get-nearby/:long/:lat/:item").get(getNearby);
// router.route("/get-adminpost/").get(getAdminPosts);

//book
// router.route("/book-reviews/:id").get(getReviews);
// router.route("/book-exchanges/:id").get(getExchanges);
// router.route("/book-myposts/:id").get(getMyPosts);

// upload-image
router.route("/upload-image").post(formidable(), uploadImage);

// like
router.route("/like").put(likePost);
router.route("/unlike").put(unlikePost);

router.route("/save").put(savePost);
router.route("/unsave").put(unsavePost);

// comment
router.route("/add-comment").put(addComment);
router.route("/remove-comment").put(removeComment);

router.route("/total-posts").get(totalPosts);

//admin
router.route("/admin/delete/:id").delete(isAdmin, deletePost);

// get post with userID 

router.route("/withUser/:userId").get(getPostsWithUserId);
router.route("/number-with-user/:userId").get(getNumberOfPostsWithUserId);

router.route("/withUserAndBook/:userId/:bookId").get(getPostsWithUserIdWithBook);
router.route("/saved").get(getSavedPosts);

router.route("/stats/:userId/:year").get(getStats);



router.route("/report").patch(report);
router.route("/unreport").patch(isAdmin,dismissReport);



router
    .route("/:id")
    .get(getPost)
    .patch(canUpdateOrDeletePost, editPost)
    .delete(canUpdateOrDeletePost, deletePost);

export default router;
