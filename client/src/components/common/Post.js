import React, { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
// icon
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineSend,
  AiOutlineCamera,
} from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import { MdCancel } from "react-icons/md";
// component
import Comment from "./Comment";
import { useAppContext } from "../../context/useContext";
import ReviewForm from "./ReviewForm";
import { Rating } from "@mui/material";
import ReactMarkdown from "react-markdown";
import Modal from "./Modal";
import { formatDate } from "../../utils/formatDate";

const Post = ({
  currentPost,
  className = "",
  book,
  border = true,
  getDeletePostId = (postId) => {},
}) => {
  // const navigate = useNavigate();
  const { autoFetch, socket, user } = useAppContext();
  // const [formOpen, setFormOpen] = useState(false)
  const [showOption, setShowOption] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [post, setPost] = useState(currentPost);
  const [textComment, setTextComment] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const [imageComment, setImageComment] = useState(null);
  const [formData, setFormData] = useState(null);

  // open model for edit post
  const [openModal, setOpenModal] = useState(false);

  const [input, setInput] = useState({
    title: currentPost?.detail?.title || "",
    text: currentPost?.text || "",
    rating: currentPost?.detail?.rating || "",
    content: currentPost?.detail?.content || "",
    development: currentPost?.detail?.development || "",
    pacing: currentPost?.detail?.pacing || "",
    writing: currentPost?.detail?.writing || "",
    insights: currentPost?.detail?.insights || "",
    dateRead: currentPost?.detail?.dateRead || "",
    image: currentPost?.image || "",
    condition: currentPost?.detail?.condition || "",
    address: currentPost?.detail?.address || "",
    location: currentPost?.detail?.location || "",
    hashtag: currentPost?.hashtag?.map((one) => one.name) || [],
    spoiler: currentPost?.spoiler || false,
    postType: currentPost?.postType || "",
  });

  const [attachment, setAttachment] = useState(
    currentPost?.image ? "photo" : ""
  );
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [type, setType] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerModalOpen, setAnswerModalOpen] = useState(false);

  const [viewMoreRating, setViewMoreRating] = useState(false);
  const [spoilerView, setSpoilerView] = useState(false);

  const [showFullText, setShowFullText] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getType();
  }, []);

  let likeCount = post?.likes?.length || 0;
  let commentCount = post?.comments?.length || 0;

  const getType = () => {
    const postType = currentPost?.postType?.toLowerCase();
    setType(postType);
  };

  // set image to show in form
  const handleImage = (e) => {
    setImageComment(null);
    const file = e.target.files[0];
    // @ts-ignore
    setImageComment({ url: URL.createObjectURL(file) });

    let formData = new FormData();
    formData.append("image", file);

    // @ts-ignore
    setFormData(formData);
  };

  // delete image in form
  const deleteImageComment = () => {
    setImageComment(null);
  };

  // upload image to cloudinary
  const handleUpImageComment = async () => {
    try {
      const { data } = await autoFetch.post(`/api/post/upload-image`, formData);
      return { url: data.url, public_id: data.public_id };
    } catch (error) {
      toast.error("Upload image fail!");
      return null;
    }
  };

  const addComment = async (postId) => {
    if (!textComment) {
      return;
    }
    setCommentLoading(true);
    try {
      let image;
      if (imageComment) {
        image = await handleUpImageComment();
        if (!image) {
          setCommentLoading(false);
          setImageComment(null);
          return;
        }
      }
      const { data } = await autoFetch.put(`/api/post/add-comment`, {
        postId,
        comment: textComment,
        image,
      });
      setPost({ ...post, comments: data.post.comments });
      setShowComment(true);
      setTextComment("");
      setImageComment(null);
      socket.emit("new-comment", {
        senderName: user.name,
        senderId: user._id,
        receivedId: post.postedBy._id,
      });
    } catch (error) {
      console.log(error);
    }
    setCommentLoading(false);
  };

  const unlike = async (postId) => {
    setLikeLoading(true);
    try {
      const { data } = await autoFetch.put(`/api/post/unlike`, {
        postId,
      });
      setPost({ ...post, likes: data.post.likes });
    } catch (error) {
      console.log(error);
    }
    setLikeLoading(false);
  };

  const like = async (postId) => {
    setLikeLoading(true);
    try {
      const { data } = await autoFetch.put(`/api/post/like`, { postId });
      setPost({ ...post, likes: data.post.likes });
    } catch (error) {
      console.log(error);
    }
    setLikeLoading(false);
  };

  const unsave = async () => {
    try {
      const { data } = await autoFetch.put(`/api/post/unsave`, {
        postId: post._id,
      });
      setPost({ ...post, save: data.post.save });
      toast.success("Post unsaved!")

    } catch (error) {
      console.log(error);
      toast.success("Something went wrong")

    }
  };

  const save = async () => {
    try {
      const { data } = await autoFetch.put(`/api/post/save`, { postId: post._id });
      setPost({ ...post, save: data.post.save });
      toast.success("Post saved!")
    } catch (error) {
      console.log(error);
      toast.success("Something went wrong")
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const { data } = await autoFetch.put(`/api/post/remove-comment`, {
        postId: post._id,
        commentId,
      });
      setPost({ ...post, comments: data.post.comments });
      toast("You have deleted comment! ");
    } catch (error) {
      console.log(error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const { data } = await autoFetch.delete(`api/${type}/${postId}`);
      setIsDelete(true);
      toast(data.msg);
      // getDeletePostId(postId);
    } catch (error) {
      console.log(error);
    }
  };

  const reportPost = async (postId) => {
    try {
      const { data } = await autoFetch.patch(`api/post/report`, {
        postId,
      });
      toast("Report succesfully! An admin will look into your request");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const getAIRes = async (postId) => {
    toast("Please wait...");
    try {
      const { data } = await autoFetch.get(`api/question/ai/${postId}`);
      setAnswer(data.reply);
      setAnswerModalOpen(true);
      // toast.update(toastId, { render: "The answer is here!", type: "success", isLoading: false, autoClose: 2000, });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const MainContent = () => {
    return (
      <div>
        {post?.detail?.title && (
          <div className="content mt-3 serif-display font-semibold text-2xl">
            {post?.detail?.title}
          </div>
        )}

        <div
          className={`content mt-[11px] "
          } `}
        >
          <ReactMarkdown className={`markdown`}>
            {post?.text.length < 1000
              ? post?.text
              : showFullText
              ? post?.text
              : post?.text.slice(0, 1000)}
          </ReactMarkdown>
        </div>

        {post?.text.length > 500 && (
          <div
            className="font-semibold text-sm cursor-pointer"
            onClick={() => {
              setShowFullText((prev) => !prev);
            }}
          >
            {showFullText ? "Show less" : "Show more"}
          </div>
        )}
        {post?.hashtag && (
          <div className="">
            {post?.hashtag?.map((one) => (
              <div
                className="cursor-pointer text-xs inline-block rounded-full bg-dialogue px-2 py-1 my-1 mr-1"
                onClick={() => {
                  navigate(
                    `/search/?q=${encodeURIComponent(
                      JSON.stringify(`#${one?.name}`)
                    )}&searchType=${type}`
                  );
                }}
              >
                {one?.name}
              </div>
            ))}
          </div>
        )}

        {/* when has image */}
        {post?.image && (
          <div className="mt-3 flex items-center justify-center cursor-pointer ">
            <img
              src={post?.image?.url}
              alt="img_content"
              className="w-full rounded-lg h-auto max-h-[300px] sm:max-h-[350px] object-contain bg-navBar"
              onClick={() => {
                navigate(`/detail/${type}/${post?._id}`);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // when post was delete
  if (isDelete) {
    return null;
  }

  // when error data
  if (!post?.postedBy) {
    return null;
  }

  if (loadingEdit) {
    return (
      <div className="w-full flex justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );
  }

  return (
    <div
      className={` mb-3 pt-3 pb-2.5 ${
        border ? `border-t-[1px] border-t-dialogue` : ``
      } `}
    >
      {openModal && (
        <ReviewForm
          setOpenModal={setOpenModal}
          setPostLoading={setLoadingEdit}
          current={post}
          setPost={setPost}
          type={type}
        />
      )}

      {answerModalOpen && (
        <Modal
          setOpenModal={setAnswerModalOpen}
          name="Here's your answer"
          text={answer}
        />
      )}

      {/* header post */}
      <div className="flex items-center">
        {/* avatar */}
        <img
          src={post?.postedBy?.image?.url}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover cursor-pointer "
          onClick={() => {
            navigate(`/profile/${post?.postedBy?._id}`);
          }}
        />
        {/* name and time post */}
        <div className={`ml-2 `}>
          <div
            className="flex items-center text-xs font-bold gap-x-1 cursor-pointer "
            onClick={() => {
              navigate(`/profile/${post?.postedBy?._id}`);
            }}
          >
            {post?.postedBy?.name}
            {post?.postedBy?.role === 1 && (
              <TiTick className="text-sm ml-1 text-white rounded-full bg-greenBtn " />
            )}
            {post?.postedBy?.role === 2 && (
              <TiTick className="text-sm ml-1 text-white rounded-full bg-blue-700 " />
            )}
          </div>

          <div
            className="text-[10px] flex items-center gap-x-1 cursor-pointer hover:underline"
            // style={{"text-decoration": "underline"}}
            onClick={() => {
              navigate(`/detail/${type}/${post?._id}`);
            }}
          >
            {moment(post?.createdAt).fromNow()} • {post.postType}
          </div>
        </div>
        {/* Edit or delete posts */}

        <div
          className="ml-auto text-[25px] transition-50 cursor-pointer font-bold w-[35px] h-[35px] rounded-full hover:bg-dialogue flex flex-row items-center justify-center group relative "
          onClick={() => {
            setShowOption(!showOption);
          }}
        >
          <div className="translate-y-[-6px] z-[10]">...</div>
          <ul
            className={`text-xs absolute -left-[120%] top-[110%] text-center ${
              !showOption ? "hidden" : "flex flex-col"
            }   `}
            onMouseLeave={() => {
              setShowOption(false);
            }}
          >
            {post?.saved?.some((one)=>one.savedBy === user._id) ?    <li
                  className="mt-1 px-3 py-1 bg-navBar rounded-md"
                  onClick={() => {
                      unsave();
                  }}
                >
                  Unsave
                </li>: <li
                  className="mt-1 px-3 py-1 bg-navBar rounded-md"
                  onClick={() => {
                      save();
                  }}
                >
                  Save
                </li>}
            {user?._id === post?.postedBy?._id && (
              <>
                <li
                  className="px-3 py-1 bg-navBar rounded-md"
                  onClick={() => {
                    setOpenModal(true);
                  }}
                >
                  Edit
                </li>
                <li
                  className="mt-1 px-3 py-1 bg-navBar rounded-md"
                  onClick={() => {
                    if (window.confirm("Do you want to delete this post?")) {
                      deletePost(post?._id);
                    }
                  }}
                >
                  Delete
                </li>
              </>
            )}

            {user?._id !== post?.postedBy?._id &&
              post?.postedBy?.type !== 1 && (
                <li
                  className="mt-1 px-3 py-1 bg-navBar rounded-md"
                  onClick={() => {
                    if (window.confirm("Do you want to report this post?")) {
                      reportPost(post?._id);
                    }
                  }}
                >
                  Report
                </li>
              )}

            {type === "question" && (
              <li
                className="mt-1 px-3 py-1 bg-navBar rounded-md"
                onClick={() => {
                  getAIRes(post?._id);
                }}
              >
                Ask AI
              </li>
            )}
          </ul>
        </div>
      </div>

      {post?.detail?.address && (
        <div
          className="content mt-3 font-bold text-gray-500 text-xs"
          onClick={() => console.log(post)}
        >
          {post?.detail?.address?.slice(0, 80)}...
        </div>
      )}

      {post?.detail?.condition && (
        <div className="content mt-2 font-bold text-gray-500 text-xs">
          Condition: {post?.detail?.condition}{" "}
        </div>
      )}

      {post?.detail?.book && !book && (
        <div className="flex items-center mt-2 pr-3 gap-y-2">
          {/* avatar */}
          <img
            src={
              post?.detail?.book?.thumbnail ||
              "https://sciendo.com/product-not-found.png"
            }
            alt="avatar"
            className="max-h-20 rounded-md cursor-pointer "
            onClick={() => {
              navigate(`/book/${post?.detail?.book?._id}`);
            }}
          />
          {/* name and time post */}
          <div className={`ml-2 flex flex-col gap-y-1`}>
            <div
              className="flex items-center font-bold text-sm gap-x-1 cursor-pointer "
              onClick={() => {
                navigate(`/book/${post?.detail?.book?._id}`);
              }}
            >
              {post?.detail?.book?.title}
            </div>

            <div className="text-xs dark:text-[#B0B3B8] flex items-center gap-x-1 ">
              {post?.detail?.book?.author}
            </div>
            {post?.detail?.rating && (
              <div className="flex items-center gap-x-1  cursor-pointer mt-2">
                <Rating
                  className="!text-[16px]"
                  value={post?.detail?.rating}
                  precision={0.5}
                  readOnly
                />
              </div>
            )}
            {post?.detail?.progress && (
              <div className="text-xs text-smallText flex items-center gap-x-1 ">
                At page{" "}
                <span className="font-semibold">{post?.detail?.progress}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {post?.detail?.rating && book && (
        <div>
          <div className="content mt-[11px]">
            <div className="flex items-center gap-x-2">
              <div className="">Overall</div>
              <Rating value={post?.detail?.rating} precision={0.5} readOnly />
            </div>
          </div>
        </div>
      )}

      {post?.detail?.rating && (
        <div
          className={`text-xs text-smallText cursor-pointer ${
            viewMoreRating && `hidden`
          }`}
          onClick={() => {
            setViewMoreRating(true);
          }}
        >
          See more
        </div>
      )}

      {viewMoreRating && (
        <div>
          <div className="grid grid-cols-2 my-1">
            <div className="flex items-center gap-x-2">
              <div className="text-sm">Content</div>
              <Rating
                className="!text-lg"
                value={post?.detail?.content}
                precision={0.5}
                readOnly
              />
            </div>

            <div className="flex items-center gap-x-2">
              <div className="text-sm">Development</div>
              <Rating
                className="!text-lg"
                value={post?.detail?.development}
                precision={0.5}
                readOnly
              />
            </div>

            <div className="flex items-center gap-x-2">
              <div className="text-sm">Writing</div>
              <Rating
                className="!text-lg"
                value={post?.detail?.writing}
                precision={0.5}
                readOnly
              />
            </div>

            <div className="flex items-center gap-x-2">
              <div className="text-sm">Insights</div>
              <Rating
                className="!text-lg"
                value={post?.detail?.insights}
                precision={0.5}
                readOnly
              />
            </div>
          </div>

          {post?.detail?.dateRead && (
            <div className="content mt-2 font-bold text-gray-500 text-xs">
              Read on: {formatDate(post?.detail?.dateRead)}
            </div>
          )}
        </div>
      )}

      {post?.spoiler && (
        <div
          className={`${
            spoilerView && `hidden`
          } flex flex-col items-center gap-y-2 my-2`}
        >
          <div className="font-semibold">Warning! Spoiler ahead!</div>
          <button
            className="primary-btn bg-black"
            onClick={() => {
              setSpoilerView(true);
            }}
          >
            I can handle the truth
          </button>
        </div>
      )}

      {post?.spoiler && spoilerView && <MainContent />}
      {!post?.spoiler && <MainContent />}

      {/* post's comment and like quantity */}
      <div className="py-[10px] flex gap-x-[6px] items-center text-[15px] ">
        {/* like quantity */}

        <>
          {!post?.likes?.includes(user._id) ? (
            <>
              <AiOutlineHeart
                onClick={() => like(post._id)}
                disabled={likeLoading}
                className="cursor-pointer text-[18px] text-[#65676b] dark:text-[#afb0b1]"
              />
              <span className="like-count">
                {`${likeCount} like${likeCount > 1 ? "s" : ""}`}
              </span>
            </>
          ) : (
            <>
              <AiFillHeart
                onClick={() => unlike(post._id)}
                disabled={likeLoading}
                className="cursor-pointer text-[18px] text-[#c22727]"
              />
              <span className="like-count">
                {likeCount > 1
                  ? `You and ${likeCount - 1} other${likeCount > 2 ? "s" : ""}`
                  : `You`}
              </span>
            </>
          )}
        </>
        {/* comment quantity */}
        <span
          className="cursor-pointer text-[14px] ml-auto text-[#65676b] dark:text-[#afb0b1] 
          "
          onClick={() => {
            setShowComment(!showComment);
          }}
          disabled={!commentCount}
        >
          {commentCount > 0 &&
            `${commentCount} ${commentCount > 1 ? "comments" : "comment"}`}
        </span>
      </div>

      {/* comment box */}
      {showComment && (
        <div className="pt-1 ">
          {post?.comments?.map((comment) => (
            <Comment
              key={comment?._id}
              currentComment={comment}
              userId={user?._id}
              deleteComment={deleteComment}
              autoFetch={autoFetch}
              postId={post?._id}
              navigate={navigate}
              user_img={user?.image?.url || "/images/avatar.png"}
            />
          ))}
        </div>
      )}

      {/* form add comment */}
      <div className="flex gap-x-1.5 py-1 mt-1 items-start">
        <img
          src={user?.image?.url || "/images/avatar.png"}
          alt="user_avatar"
          className="w-8 h-8 object-cover shrink-0 rounded-full "
        />
        <div className="w-full flex flex-col">
          <form
            className="flex w-full px-2  rounded-lg bg-[#2c3440] items-start "
            onSubmit={(e) => {
              e.preventDefault();
              addComment(post?._id);
            }}
          >
            <textarea
              type="text"
              className="px-2 py-1 text-sm sm:py-1.5 border-none focus:ring-0 bg-inherit rounded-lg w-full font-medium dark:placeholder:text-[#b0b3b8] "
              placeholder="Write a comment..."
              value={textComment}
              disabled={commentLoading}
              onChange={(e) => {
                setTextComment(e.target.value);
              }}
            />
            {!commentLoading && (
              <label className="py-2">
                <AiOutlineCamera className="shrink-0 text-[18px] transition-50 mr-2 opacity-60 hover:opacity-100 dark:text-[#b0b3b8] cursor-pointer " />
                <input
                  onChange={handleImage}
                  type="file"
                  accept="image/*"
                  name="avatar"
                  hidden
                />
              </label>
            )}
            <button
              className="py-2"
              type="submit"
              disabled={commentLoading || !textComment}
            >
              {commentLoading ? (
                <ReactLoading
                  type="spin"
                  width={20}
                  height={20}
                  color="#7d838c"
                />
              ) : (
                <AiOutlineSend className="shrink-0 text-[18px] transition-50 cursor-pointer opacity-60 hover:opacity-100 dark:text-[#b0b3b8]" />
              )}
            </button>
          </form>

          <div className="transition-50 flex items-start justify-start w-full group ">
            {imageComment && (
              <div className="relative ">
                <img
                  // @ts-ignore
                  src={imageComment?.url}
                  alt="image_comment"
                  className="h-20 w-auto rounded-lg object-contain "
                />
                {!commentLoading && (
                  <MdCancel
                    className="absolute hidden group-hover:flex top-1 right-1 text-xl transition-50 cursor-pointer "
                    onClick={deleteImageComment}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* image when comment have image */}
    </div>
  );
};

export default Post;
