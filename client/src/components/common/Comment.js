import React, {useEffect, useRef, useState} from "react";
import ReactLoading from "react-loading";
import useKeypress from "react-use-keypress";
import {toast} from "react-toastify";
//component
//icon
import {AiOutlineCamera, AiOutlineSend} from "react-icons/ai";
import {TiTick} from "react-icons/ti";
import {MdCancel} from "react-icons/md";

const Comment = ({
    currentComment,
    userId,
    deleteComment,
    autoFetch,
    postId,
    navigate,
    user_img,
}) => {
    const [showOption, setShowOption] = useState(false);
    const [editComment, setEditComment] = useState(false);
    const [comment, setComment] = useState(currentComment);
    const [text, setText] = useState(currentComment.text);
    const [editLoading, setEditLoading] = useState(false);
    const [likeCommentLoading, setLikeCommentLoading] = useState(false);
    const [imageEdit, setImageEdit] = useState(currentComment?.image || null);
    const [formData, setFormData] = useState(null);

    const cmtHistory = useRef(currentComment.text);

    const cancelEdit = () => {
        setEditComment(false);
        setShowOption(false);
        setText(cmtHistory.current);
        setImageEdit(currentComment?.image);
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        setImageEdit({url: URL.createObjectURL(file)});

        let formData = new FormData();
        formData.append("image", file);
        // @ts-ignore
        setFormData(formData);
    };

    const uploadOtherImage = async () => {
        try {
            const {data} = await autoFetch.post(
                `/api/post/upload-image`,
                formData
            );
            return {url: data.url, public_id: data.public_id};
        } catch (error) {
            toast.error("Upload image fail!");
            return null;
        }
    };

    useKeypress("Escape", cancelEdit);

    const handleComment = async (text) => {
        setEditLoading(true);
        try {
            let image = imageEdit;
            if (imageEdit) {
                if (imageEdit.url !== comment?.image?.url) {
                    image = await uploadOtherImage();
                    // when upload false
                    if (!image) {
                        setEditLoading(false);
                        setImageEdit(comment?.image);
                        return;
                    }
                }
            }
            await autoFetch.patch(`/api/post/edit-comment`, {
                postId,
                text,
                commentId: comment._id,
                image,
            });
            setEditComment(false);
            cmtHistory.current = text;
        } catch (error) {
            console.log(error);
        }
        setEditLoading(false);
    };

    const likeComment = async () => {
        setLikeCommentLoading(true);
        try {
            const {data} = await autoFetch.put(`/api/post/like-comment`, {
                postId,
                commentId: comment._id,
            });
            setComment({...comment, like: data.comment.like});
        } catch (error) {
            console.log(error);
        }
        setLikeCommentLoading(false);
    };

    const unlikeComment = async () => {
        setLikeCommentLoading(true);
        try {
            const {data} = await autoFetch.put(`/api/post/unlike-comment`, {
                postId,
                commentId: comment._id,
            });
            setComment({...comment, like: data.comment.like});
        } catch (error) {
            console.log(error);
        }
        setLikeCommentLoading(false);
    };

    const handleLikeComment = () => {
        if (comment.like?.includes(userId)) {
            unlikeComment();
        } else {
            likeComment();
        }
    };

    const toggleEdit = () => {
        setEditComment(!editComment);
    };

    const handleDeleteComment = () => {
        if (window.confirm("Do u want delete this comment?")) {
            deleteComment(comment._id);
        }
    };


    if (!currentComment.postedBy) {
        return (
            <div className=' rounded-xl bg-[#F0F2F5] dark:bg-[#3A3B3C] px-3 py-2 w-auto my-2 relative border border-red-500 opacity-50 '>
                This comment has been removed because the user is banned.
            </div>
        );
    }

    // Edit mode
    if (editComment) {
        return (
            <div className='flex gap-x-1.5 py-1 '>
                <img
                    src={comment.postedBy?.image?.url}
                    alt='user_avatar'
                    className='w-[35px] h-[35px] object-cover shrink-0 rounded-full mt-1  '
                />
                <div className='w-full'>
                    <form
                        className='flex px-2 rounded-full bg-[#F0F2F5] w-full mt-1 items-center dark:bg-[#3A3B3C]  '
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (text) {
                                handleComment(text);
                            }
                        }}>
                        <input
                            type='text'
                            className='px-2 py-1.5 border-none focus:ring-0 bg-inherit rounded-full w-full font-medium dark:placeholder:text-[#b0b3b8] '
                            placeholder='Write a comment...'
                            value={text}
                            disabled={editLoading}
                            onChange={(e) => {
                                setText(e.target.value);
                            }}
                        />
                        {!editLoading && (
                            <label>
                                <AiOutlineCamera className='shrink-0 text-[18px] transition-50 mr-2 opacity-60 hover:opacity-100 dark:text-[#b0b3b8] cursor-pointer ' />
                                <input
                                    onChange={handleImage}
                                    type='file'
                                    accept='image/*'
                                    name='avatar'
                                    hidden
                                />
                            </label>
                        )}
                        <button type='submit' disabled={editLoading || !text}>
                            {editLoading ? (
                                <ReactLoading
                                    type='spin'
                                    width={20}
                                    height={20}
                                    color='#7d838c'
                                />
                            ) : (
                                <AiOutlineSend className='shrink-0 text-[18px] transition-50 cursor-pointer opacity-60 hover:opacity-100 dark:text-[#b0b3b8] ' />
                            )}
                        </button>
                    </form>
                    {imageEdit && (
                        <div className='relative w-max '>
                            <img
                                src={imageEdit?.url}
                                alt='image_comment'
                                className='object-contain w-auto my-1 ml-3 max-h-52 '
                            />
                            {!editLoading && (
                                <MdCancel
                                    className='absolute text-2xl cursor-pointer top-1 right-1 transition-50 '
                                    onClick={() => {
                                        setImageEdit(null);
                                    }}
                                />
                            )}
                        </div>
                    )}
                    <p className='text-[12px] dark:text-[#b0b3b8] ml-3 '>
                        Press Esc to{" "}
                        <span
                            className='text-[#ab2b3a] cursor-pointer '
                            onClick={cancelEdit}>
                            cancel
                        </span>
                        .
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative mt-4 `}>
            {/* comment main */}
            <div className='relative flex gap-x-1.5 mt-1.5 group'>
                <img
                    src={comment.postedBy?.image?.url}
                    alt='own_avt_cmt'
                    className='z-10 object-cover w-10 h-10 rounded-full cursor-pointer '
                    onClick={() => {
                        console.log('aaa')
                        navigate(`/profile/${comment.postedBy?._id}`);
                    }}
                />
                <div
                    className={`box-comment relative w-full ${
                        editLoading && "opacity-50"
                    } `}>
                    <div className='flex items-center w-full gap-x-1 '>
                        <div className='rounded-xl bg-[#F0F2F5] dark:bg-[#3A3B3C] px-3 py-2 max-w-full relative  '>
                            <div
                                className='font-bold text-[13px] text-[#050505] dark:text-[#e4e6eb] flex items-center gap-x-1 cursor-pointer '
                                onClick={() => {
                                    navigate(
                                        `/profile/${comment.postedBy?._id}`
                                    );
                                }}>
                                {comment.postedBy?.name}
                                {comment.postedBy?.role === 1 && (
                                    <TiTick className='text-[13px] text-white rounded-full bg-blue-700 ' />
                                )}
                            </div>
                            <div
                                className={`content text-[15px] text-[#050505] dark:text-[#cecfd1] `}>
                                {text}
                            </div>
                            {imageEdit&&<img src={imageEdit.url} />}

                            {imageEdit && (
                                <img
                                    src={imageEdit?.url}
                                    alt='image_comment'
                                    className='max-h-60 w-auto object-contain my-0.5 '
                                />
                            )}

                            {/* edit or delete comment */}
                            {userId === comment.postedBy?._id && (
                                <div
                                    className='shrink-1 w-10 h-10 hidden group-hover:flex cursor-pointer text-[23px] font-extrabold hover:bg-[#F0F2F5] items-center justify-center rounded-full transition-50 dark:hover:bg-[#3A3B3C] absolute z-[100]  right-[-45px] top-[50%] translate-y-[-50%] '
                                    onClick={() => {
                                        setShowOption(!showOption);
                                    }}>
                                    <div className='translate-y-[-6px] '>
                                        ...
                                    </div>
                                    <ul
                                        className={`text-xs absolute top-[110%] text-center ${
                                            !showOption
                                                ? "hidden"
                                                : "flex flex-col"
                                        }`}
                                        onMouseLeave={() => {
                                            setShowOption(false);
                                        }}>
                                        <li
                                            className='px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60 !text-xs'
                                            onClick={toggleEdit}>
                                            Edit
                                        </li>
                                        <li
                                            className='mt-1 px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60 !text-xs'
                                            onClick={handleDeleteComment}>
                                            Delete
                                        </li>
                                    </ul>
                                </div>
                            )}
                         
                        </div>
                    </div>
                </div>
            </div>
          
        </div>
    );
};

export default Comment;
