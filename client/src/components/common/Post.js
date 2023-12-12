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
import Modal from "./Modal";
import PostLoading from "../loading/Loading.Post";
import ReviewForm from "./ReviewForm";
// const typeOfPost = ['post','review','trade','specialPost']
import PostForm from "./PostForm";
import TradeForm from "./TradeForm";
import SpecialPostForm from "./SpecialPostForm";
import { Rating } from "@mui/material";
import ReactMarkdown from 'react-markdown';
import QuestionForm from "./QuestionForm";

const Post = ({
  currentPost,
  user_img,
  userId,
  className = "",
  userRole,
  book,
  getDeletePostId = (postId) => {},
}) => {
  // const navigate = useNavigate();
  const { autoFetch } = useAppContext();
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
    title: currentPost.title || "",
    text: currentPost.text || "",
    rating: currentPost.rating || "",
    content: currentPost.content || "",
    development: currentPost.development || "",
    pacing: currentPost.pacing || "",
    writing: currentPost.writing || "",
    insights: currentPost.insights || "",
    dateRead: currentPost.dateRead || "",
    image: currentPost.image || "",
    condition: currentPost.condition || "",
    address: currentPost.address || "",
    location: currentPost.location || "",
  });

  const [attachment, setAttachment] = useState(
    currentPost.image ? "photo" : ""
  );
  // const [imageEdit, setImageEdit] = useState(currentPost.image);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const navigate = useNavigate();
  const [type, setType] = useState("");

  // open modal
  // useEffect(() => {
  //   setOneState("openModal", openModal);
  // }, [openModal]);

  useEffect(() => {
    getType();
  }, []);

  let likeCount = post?.likes?.length || 0;
  let commentCount = post?.comments?.length || 0;

  const getType = () => {
    if (post.rating) setType("review");
    else if (post.address) setType("trade");
    else if (post.type) setType("special");
    else if (post.book) setType("question")
    else setType("post");
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
      const { data } = await autoFetch.put(`/api/${type}/add-comment`, {
        postId,
        comment: textComment,
        image,
      });
      setPost({ ...post, comments: data.post.comments });
      setShowComment(true);
      setTextComment("");
      setImageComment(null);
    } catch (error) {
      console.log(error);
    }
    setCommentLoading(false);
  };

  const unlike = async (postId) => {
    setLikeLoading(true);
    try {
      const { data } = await autoFetch.put(`/api/${type}/unlike`, {
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
      const { data } = await autoFetch.put(`/api/${type}/like`, { postId });
      setPost({ ...post, likes: data.post.likes });
    } catch (error) {
      console.log(error);
    }
    setLikeLoading(false);
  };

  const deleteComment = async (commentId) => {
    try {
      const { data } = await autoFetch.put(`/api/${type}/remove-comment`, {
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
      getDeletePostId(postId);
    } catch (error) {
      console.log(error);
    }
  };

  //update post
  const updatePost = async () => {
    setLoadingEdit(true);
    try {
      let image = input.image;
      if (formData) {
        image = await handleUpImageComment();
        if (!image) {
          toast.error("Upload image fail. Try again!");
          setLoadingEdit(false);
          return;
        }
      }
      let postData;
      if (type === "post") {
        const { data } = await autoFetch.patch(`api/post/${currentPost._id}`, {
          text: input.text,
          image: image,
          title: input.title,
        });
        postData = data.post;
      } else if (type === "review") {
        const { data } = await autoFetch.patch(
          `api/review/${currentPost._id}`,
          {
            text: input.text,
            rating: input.rating,
            title: input.title,
            content: input.content,
            development: input.development,
            pacing: input.pacing,
            writing: input.writing,
            insights: input.insights,
            dateRead: input.dateRead,
            image: image,
          }
        );
        postData = data.post;
      } else if (type === "trade") {
        const { data } = await autoFetch.patch(`api/trade/${currentPost._id}`, {
          text: input.text,
          condition: input.condition,
          address: input.address,
          location: input.location,
          image,
        });
        postData = data.post;
      } else if (type === "special") {
        const { data } = await autoFetch.patch(
          `api/special/${currentPost._id}`,
          {
            text: input.text,
            image: image,
            title: input.title,
          }
        );
        postData = data.post;
      } else if (type === "question") {
        const { data } = await autoFetch.patch(
          `api/question/${currentPost._id}`,
          {
            text: input.text,
            image: image,
            title: input.title,
          }
        );
        postData = data.post;
      }

      // setPost(data.post);
      setPost({
        ...post,
        text: postData.text,
        title: postData.title || "",
        rating: postData.rating || "",
        content: postData.content || "",
        development: postData.development || "",
        pacing: postData.pacing || "",
        writing: postData.writing || "",
        insights: postData.insights || "",
        dateRead: postData.dateRead || "",
        image: postData.image || "",
        address: postData.address || "",
        location: postData.location || "",
        condition: postData.condition || "",
      });

      setInput({
        // ...post,
        text: postData.text,
        title: postData.title || "",
        rating: postData.rating || "",
        content: postData.content || "",
        development: postData.development || "",
        pacing: postData.pacing || "",
        writing: postData.writing || "",
        insights: postData.insights || "",
        dateRead: postData.dateRead || "",
        image: postData.image || "",
        address: postData.address || "",
        location: postData.location || "",
        condition: postData.condition || "",
      });

      if (postData.image) {
        setAttachment("photo");
      }
      toast("Update post success!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
    setLoadingEdit(false);
    setFormData(null);
  };

  // when post was delete
  if (isDelete) {
    return null;
  }

  // when error data
  if (!post.postedBy) {
    return null;
  }

  if (loadingEdit) {
    return <PostLoading className="mb-4" />;
  }

  return (
    <div className={` mb-3 pt-3 pb-2.5  border-t-[1px] border-t-dialogue`}>
      {openModal && type === "post" && (
        <PostForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          isEditPost={true}
          // imageEdit={imageEdit}
          setFormDataEdit={setFormData}
          handleEditPost={updatePost}
          // setImageEdit={setImageEdit}
          // type={type}
        />
      )}

      {openModal && type === "review" && (
        <ReviewForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          isEditPost={true}
          // imageEdit={imageEdit}
          setFormDataEdit={setFormData}
          handleEditPost={updatePost}
          // setImageEdit={setImageEdit}
          // type={type}
        />
      )}

      {openModal && type === "trade" && (
        <TradeForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          isEditPost={true}
          // imageEdit={imageEdit}
          setFormDataEdit={setFormData}
          handleEditPost={updatePost}
          // setImageEdit={setImageEdit}
          // type={type}
        />
      )}

      {openModal && type === "special" && (
        <SpecialPostForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          isEditPost={true}
          setFormDataEdit={setFormData}
          handleEditPost={updatePost}
        />
      )}

{openModal && type === "question" && (
        <QuestionForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          isEditPost={true}
          setFormDataEdit={setFormData}
          handleEditPost={updatePost}
        />
      )}

      {/* header post */}
      <div className="flex items-center px-4">
        {/* avatar */}
        <img
          src={post.postedBy.image.url}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover cursor-pointer "
          onClick={() => {
            navigate(`/profile/${post.postedBy._id}`);
          }}
        />
        {/* name and time post */}
        <div className={`ml-2 `}>
          <div
            className="flex items-center text-sm font-bold gap-x-1 cursor-pointer "
            onClick={() => {
              navigate(`/profile/${post.postedBy._id}`);
            }}
          >
            {post.postedBy.name}
            {post.postedBy.role === 1 && (
              <TiTick className="text-sm ml-1 text-white rounded-full bg-greenBtn " />
            )}
            {post.postedBy.role === 2 && (
              <TiTick className="text-sm ml-1 text-white rounded-full bg-blue-700 " />
            )}
          </div>

          <div className="text-[10px] flex items-center gap-x-1 ">
            {moment(post.createdAt).fromNow()}
          </div>
        </div>
        {/* Edit or delete posts */}
        {(userId === post.postedBy._id || userRole === 1) && (
          <div
            className="ml-auto text-[25px] transition-50 cursor-pointer font-bold w-[35px] h-[35px] rounded-full hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] flex flex-row items-center justify-center group relative "
            onClick={() => {
              setShowOption(!showOption);
            }}
          >
            <div className="translate-y-[-6px] z-[99] ">...</div>
            <ul
              className={`text-xs absolute -left-[120%] top-[110%] text-center ${
                !showOption ? "hidden" : "flex flex-col"
              }   `}
              onMouseLeave={() => {
                setShowOption(false);
              }}
            >
              <li
                className="px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60 "
                onClick={() => {
                  setOpenModal(true);
                }}
              >
                Edit
              </li>
              <li
                className="mt-1 px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60"
                onClick={() => {
                  if (window.confirm("Do you want to delete this post?")) {
                    deletePost(post._id);
                  }
                }}
              >
                Delete
              </li>
            </ul>
          </div>
        )}
      </div>

      {post.address && (
        <div className="content mt-3 px-4 font-bold text-gray-500 text-xs" onClick={()=>console.log(post)}>
          {post.address.slice(0,80)}...
        </div>
      )}

    {post.condition && (
        <div className="content mt-2 px-4 font-bold text-gray-500 text-xs">
          Condition: {post.condition}{" "}
        </div>
      )}

      {post.book && !book ? (
        <div className="flex items-center mt-2 pr-3 ml-2 md:px-3">
          {/* avatar */}
          <img
            src={
              post.book.thumbnail || "https://sciendo.com/product-not-found.png"
            }
            alt="avatar"
            className="max-h-20 rounded-md cursor-pointer "
            onClick={() => {
              navigate(`/book/${post.book._id}`);
            }}
          />
          {/* name and time post */}
          <div className={`ml-2 `}>
            <div
              className="flex items-center font-bold text-sm gap-x-1 cursor-pointer "
              onClick={() => {
                navigate(`/book/${post.book._id}`);
              }}
            >
              {post.book.title}
            </div>

            <div className="text-xs dark:text-[#B0B3B8] flex items-center gap-x-1 ">
              {post.book.author}
            </div>
            {post.rating && (
              <div className="flex items-center gap-x-1  cursor-pointer mt-2">
                   <Rating
                   className="!text-[16px]"
          value={post.rating}
          precision={0.5}
          readOnly
        />
               
              </div>
            )}
          </div>
        </div>
      ) : post.rating ? (
        <div className="content mt-[11px] px-4">
             <Rating
          value={post.rating}
          precision={0.5}
          readOnly
        />
        </div>
      ) : (
        <></>
      )}
      {post.title && (
        <div className="content mt-3 px-4 serif-display text-2xl">
          {post.title}
        </div>
      )}

      <div
        className={`content mt-[11px] px-4  ${
          post.image || post.text.length > 60 ? "text-sm" : "text-base "
        } `}
      >
        {post.text}
      </div>

      {/* when has image */}
      {post.image && (
        <div className="mt-3 flex items-center justify-center px-2 cursor-pointer ">
          <img
            src={post.image.url}
            alt="img_content"
            className="w-full rounded-lg h-auto max-h-[300px] sm:max-h-[350px] object-contain bg-[#F0F2F5] dark:bg-[#18191A]"
            onClick={() => {
              navigate(`/post/information/${post._id}`);
            }}
          />
        </div>
      )}

      {/* post's comment and like quantity */}
      <div className="px-4 py-[10px] flex gap-x-[6px] items-center text-[15px] ">
        {/* like quantity */}

        <>
          {!post.likes.includes(userId) ? (
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
                className="cursor-pointer text-[18px] text-[#c22727] dark:text-[#c22727]"
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
        <div className="px-4 pt-1 ">
          {post.comments.map((comment) => (
            <Comment
              key={comment._id}
              currentComment={comment}
              userId={userId}
              deleteComment={deleteComment}
              autoFetch={autoFetch}
              postId={post._id}
              navigate={navigate}
              user_img={user_img}
            />
          ))}
        </div>
      )}

      {/* form add comment */}
      <div className="flex gap-x-1.5 px-2 sm:px-3 md:px-4 py-1 mt-1 items-center ">
        <img
          src={user_img}
          alt="user_avatar"
          className="w-7 h-7 object-cover shrink-0 rounded-full "
        />
        <form
          className="flex px-2 rounded-full bg-[#2c3440] w-full items-center "
          onSubmit={(e) => {
            e.preventDefault();
            addComment(post._id);
          }}
        >
          <input
            type="text"
            className="px-2 py-1 text-sm sm:py-1.5 border-none focus:ring-0 bg-inherit rounded-full w-full font-medium dark:placeholder:text-[#b0b3b8] "
            placeholder="Write a comment..."
            value={textComment}
            disabled={commentLoading}
            onChange={(e) => {
              setTextComment(e.target.value);
            }}
          />
          {!commentLoading && (
            <label>
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
          <button type="submit" disabled={commentLoading || !textComment}>
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
      </div>

      {/* image when comment have image */}
      <div className="transition-50 flex items-start justify-start w-full px-20 group ">
        {imageComment && (
          <div className="relative ">
            <img
              // @ts-ignore
              src={imageComment.url}
              alt="image_comment"
              className="h-20 w-auto object-contain "
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
  );
};

export default Post;
