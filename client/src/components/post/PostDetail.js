import { useEffect, useState } from "react";
import moment from "moment";
import { AiOutlineHeart, AiFillHeart, AiOutlineSend } from "react-icons/ai";
import ReactLoading from "react-loading";
import { FiMessageSquare } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import React from "react";
import { sanitize } from "dompurify";
import { TiTick } from "react-icons/ti";

// context
import { useAppContext } from "../../context/useContext";
//components
import { Comment } from "..";
import { LoadingPostInformation } from "..";
import { LoadingPost } from "..";
import { Post } from "..";

const initPost = {
  comments: [],
  content: "",
  createdAt: "",
  image: { url: "", public_id: "" },
  likes: [""],
  postedBy: {
    image: {
      url: "",
      public_id: "",
    },
    _id: "",
    name: "",
    email: "",
    // username: "",
  },
  updatedAt: "",
  __v: 0,
  _id: "",
};

const PostDetail = () => {
  const navigate = useNavigate();
  const currentPostId = window.location.pathname.replace(
    "/post/information/",
    ""
  );
  const { autoFetch, user, dark } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState(initPost);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [textComment, setTextComment] = useState("");

  useEffect(() => {
    getCurrentPost(currentPostId);
  }, []);

  const like = async (postId) => {
    setLikeLoading(true);
    try {
      const { data } = await autoFetch.put("/api/post/like-post", {
        postId,
      });
      setPost({ ...post, likes: data.post.likes });
    } catch (error) {
      console.log(error);
    }
    setLikeLoading(false);
  };

  const unlike = async (postId) => {
    setLikeLoading(true);
    try {
      const { data } = await autoFetch.put("/api/post/unlike-post", {
        postId,
      });
      setPost({ ...post, likes: data.post.likes });
    } catch (error) {
      console.log(error);
    }
    setLikeLoading(false);
  };

  const getCurrentPost = async (postId) => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/post/information/${postId}`);
      setLoading(false);
      setPost(data.post);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const { data } = await autoFetch.put("/api/post/remove-comment", {
        postId: post._id,
        commentId,
      });
      setPost({ ...post, comments: data.post.comments });
      toast("You have deleted comment! ");
    } catch (error) {
      console.log(error);
    }
  };

  const addComment = async (postId) => {
    if (!textComment) {
      return;
    }
    setCommentLoading(true);
    try {
      const { data } = await autoFetch.put("/api/post/add-comment", {
        postId,
        comment: textComment,
      });
      setPost({ ...post, comments: data.post.comments });
      setShowComment(true);
      setTextComment("");
    } catch (error) {
      console.log(error);
    }
    setCommentLoading(false);
  };

  if (loading) {
    return (
      <>
        <div className="hidden md:flex fixed w-screen h-screen  z-1000 dark:bg-black  dark:text-white pt-[65px] px-[15%] ">
          <LoadingPostInformation />
        </div>
        <div className="md:hidden pt-[65px] h-screen ">
          <LoadingPost />
        </div>
      </>
    );
  }

  const commentCount = post.comments.length;
  const likeCount = post.likes.length;

  return (
    <>
      <div
        className={`hidden md:flex fixed w-screen h-screen bg-[#F0F2F5] dark:bg-black dark:text-white pt-[65px] px-[15%]`}
      >
        <div
          className={`w-full h-[90%] mt-[3%]  grid grid-cols-6 rounded-lg relative overflow-hidden  ${
            !dark ? "shadow-post" : ""
          } `}
        >
          <div className="col-span-2 fixed bg-white dark:bg-[#242526] relative flex items-center justify-center h-full">
            <div className="absolute rounded-2xl h-[95%] w-[95%] flex items-center bg-[#F0F2F5] dark:bg-black  justify-center ">
              {post.image && (
                <img
                  src={post.image.url}
                  alt=""
                  className="object-cover w-full h-auto max-h-full "
                ></img>
              )}
            </div>
          </div>
          <div className="col-span-4 overflow-y-auto scroll-bar dark:bg-[#242526] p-4 h-full bg-white rounded ">
            {/* <div className="flex items-center justify-between ">
              <div
                className="flex items-center gap-x-1 "
                onClick={() => {
                  navigate(`/profile/${post.postedBy._id}`);
                }}
              >
                <img
                  src={post.postedBy.image.url}
                  alt="avatar"
                  className="w-10 h-10 rounded-full "
                />
                <div className="">
                  <div className="font-bold ">{post.postedBy.name}</div>
                 
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-[13px] opacity-70 ">
                  {moment(post.createdAt).fromNow()}
                </div>
              </div>
            </div> */}
            <div className="flex items-center">
              {/* avatar */}
              <img
                src={post.postedBy.image.url}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover cursor-pointer "
                onClick={() => {
                  navigate(`profile/${post.postedBy._id}`);
                }}
              />
              {/* name and time post */}
              <div className={`ml-2 font-bold `}>
                <div
                  className="flex items-center gap-x-1 cursor-pointer "
                  onClick={() => {
                    navigate(`profile/${post.postedBy._id}`);
                  }}
                >
                  {post.postedBy.name}
                  {post.postedBy.role === "Admin" && (
                    <TiTick className="text-[15px] ml-1 text-white rounded-full bg-blue-700 " />
                  )}
                </div>

                <div className="font-[400] text-[13px] dark:text-[#B0B3B8] flex items-center gap-x-1 ">
                  {moment(post.createdAt).fromNow()}
                </div>
              </div>
              {/* Edit or delete posts */}
              {/* {(userId === post.postedBy._id || userRole === "Admin") && (
          <div
            className="ml-auto text-[25px] transition-50 cursor-pointer font-bold w-[35px] h-[35px] rounded-full hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] flex flex-row items-center justify-center group relative "
            onClick={() => {
            //   setShowOption(!showOption);
            }}
          >
            <div className="translate-y-[-6px] z-[100] ">...</div>
            <ul
              className={`text-base absolute top-[110%] text-center 
         
                `}
              onMouseLeave={() => {
                // setShowOption(false);
              }}
            >
              <li
                className="px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60 "
                onClick={() => {
                //   setOpenModal(true);
                }}
              >
                Edit
              </li>
              <li
                className="mt-1 px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60"
                onClick={() => {
                  if (window.confirm("Do u want delete this post?")) {
                    // deletePost(post._id);
                  }
                }}
              >
                Delete
              </li>
            </ul>
          </div>
        )} */}
            </div>

            {post.address && <div
        className="content mt-3 pr-4 font-bold text-gray-500 text-xs"
       
      >{post.address}  </div>} 
              
      {(post.book) ? (
        <div className="flex items-center mt-2 pr-3">
          {/* avatar */}
          <img
            src={post.book.thumbnail}
            alt="avatar"
            className="max-h-20 rounded-md cursor-pointer "
            onClick={() => {
                navigate(`/book/${post.book.code}`);
            }}
          />
          {/* name and time post */}
          <div className={`ml-2 `}>
            <div
              className="flex items-center font-bold text-sm gap-x-1 cursor-pointer "
              onClick={() => {
                  navigate(`/book/${post.book.code}`);
              }}
            >
              {post.book.title}
            </div>

            <div className="text-xs dark:text-[#B0B3B8] flex items-center gap-x-1 ">
              {post.book.author}
            </div>
            {post.rating && (
              <div className="flex items-center gap-x-1 cursor-pointer">
                {Array.from({ length: post.rating }, (_, index) => (
                  <span key={index}>⭐</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ):post.rating? (
            <div className="content mt-[11px] px-4">
              {Array.from({ length: post.rating }, (_, index) => (
                <span key={index}>⭐</span>
              ))}
            </div>
          ):<></>
      }
            {post.title && (
              <div className="content mt-[11px] font-bold text-xl">
                {post.title}
              </div>
            )}
            <div
              className={`content my-5  ${
                post.image || post.content.length > 60
                  ? "text-sm "
                  : "text-base "
              } `}
              dangerouslySetInnerHTML={{
                __html: sanitize(post.content),
              }}
            ></div>
            {(commentCount > 0 || likeCount > 0) && (
              <div className=" py-[10px] flex gap-x-[6px] items-center text-[15px] ">
                {likeCount > 0 && (
                  <>
                    {!post.likes.includes(user._id) ? (
                      <>
                        <AiOutlineHeart className="text-[18px] text-[#65676b] dark:text-[#afb0b1]" />
                        <span className="like-count">
                          {`${likeCount} like${likeCount > 1 ? "s" : ""}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <AiFillHeart className="text-[18px] text-[#c22727] dark:text-[#c22727]" />
                        <span className="like-count">
                          {likeCount > 1
                            ? `You and ${likeCount - 1} other${
                                likeCount > 2 ? "s" : ""
                              }`
                            : `You`}
                        </span>
                      </>
                    )}
                  </>
                )}

                <span className="text-[14px] ml-auto text-[#65676b] dark:text-[#afb0b1] ">
                  {commentCount > 0 &&
                    `${commentCount} ${
                      commentCount > 1 ? "comments" : "comment"
                    }`}
                </span>
              </div>
            )}

            <div className=" mt-2 py-1 flex items-center justify-between border-y dark:border-y-[#3E4042] border-y-[#CED0D4] px-[6px]  ">
              {post.likes.includes(user._id) ? (
                <button
                  className=" py-[6px] flex items-center justify-center gap-x-1 w-full rounded-sm hover:bg-[#e0e0e0] text-[#c22727] dark:hover:bg-[#3A3B3C] font-semibold text-[15px] dark:text-[#c22727] transition-50 cursor-pointer  "
                  onClick={() => unlike(post._id)}
                  disabled={likeLoading}
                >
                  {likeLoading ? (
                    <ReactLoading
                      type="bubbles"
                      width="14%"
                      height="14%"
                      color="#c22727"
                    />
                  ) : (
                    <>
                      <AiFillHeart className="text-xl translate-y-[1px] text-[#c22727] " />
                      Like
                    </>
                  )}
                </button>
              ) : (
                <button
                  className=" py-[6px] flex items-center justify-center gap-x-1 w-full rounded-sm hover:bg-[#e0e0e0] text-[#6A7583] dark:hover:bg-[#3A3B3C] font-semibold text-[15px] dark:text-[#b0b3b8] transition-50 cursor-pointer "
                  onClick={() => like(post._id)}
                  disabled={likeLoading}
                >
                  {likeLoading ? (
                    <ReactLoading
                      type="bubbles"
                      width="14%"
                      height="14%"
                      color="#6A7583"
                    />
                  ) : (
                    <>
                      <AiOutlineHeart className="text-xl translate-y-[1px] " />
                      Like
                    </>
                  )}
                </button>
              )}

              <button
                className="py-[6px] px-2 flex items-center justify-center gap-x-1 w-full rounded-sm hover:bg-[#e0e0e0] text-[#6A7583] dark:hover:bg-[#3A3B3C] font-semibold text-[15px] dark:text-[#b0b3b8] transition-50 cursor-pointer "
                onClick={() => {
                  setShowComment(!showComment);
                }}
                disabled={!commentCount}
              >
                <FiMessageSquare className="text-xl translate-y-[2px] " />
                Comment
              </button>
            </div>

            {commentCount > 0 && (
              <div className="px-4 py-3 style-3 max-h-[38vh] overflow-y-scroll ">
                {post.comments.map((comment) => (
                  <Comment
                    // @ts-ignore
                    key={comment._id}
                    currentComment={comment}
                    userId={user._id}
                    deleteComment={deleteComment}
                    autoFetch={autoFetch}
                    navigate={navigate}
                    postId={post._id}
                    user_img={user.image.url}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-x-1.5 py-1 ">
              <img
                src={user.image.url}
                alt="user_avatar"
                className="w-[40px] h-[40px] object-cover shrink-0 rounded-full "
              />
              <form
                className="flex px-2 rounded-full bg-[#F0F2F5] w-full mt-1 items-center dark:bg-[#3A3B3C]  "
                onSubmit={(e) => {
                  e.preventDefault();
                  addComment(post._id);
                }}
              >
                <input
                  type="text"
                  className="px-2 py-1.5 border-none focus:ring-0 bg-inherit rounded-full w-full font-medium dark:placeholder:text-[#b0b3b8] "
                  placeholder="Write a comment..."
                  value={textComment}
                  disabled={commentLoading}
                  onChange={(e) => {
                    setTextComment(e.target.value);
                  }}
                />
                <button type="submit" disabled={commentLoading || !textComment}>
                  {commentLoading ? (
                    <ReactLoading
                      type="bubbles"
                      width={20}
                      height={20}
                      color="#7d838c"
                    />
                  ) : (
                    <AiOutlineSend className="shrink-0 text-[18px] transition-50 cursor-pointer opacity-60 hover:opacity-100 dark:text-[#b0b3b8] " />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden pt-[65px] px-1 min-h-screen ">
        <Post
          currentPost={post}
          userId={user._id}
          userRole={user.role}
          user_img={user.image.url}
        />
      </div>
    </>
  );
};

export default PostDetail;
