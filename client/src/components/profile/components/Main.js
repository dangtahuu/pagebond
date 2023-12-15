import React, {useEffect, useState} from "react";

// icon
import {toast} from "react-toastify";

// components
import {LoadingPost, Modal, Post, LoadingForm, FormCreatePost, PostForm} from "../..";

const Main = ({
    autoFetch,
    posts,
    own,
    dark,
    user,
    setOneState,
    loading,
    setPosts,
    getDeletePostId,
}) => {
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");

    const [attachment, setAttachment] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

    useEffect(() => {
        setOneState("openModal", openModal);
    }, [openModal]);

    const createNewPost = async (formData) => {
        setLoadingCreateNewPost(true);
        if (!text) {
            toast.error("You must type something!");
            return;
        }
        try {
            let image = null;
            if (formData) {
                const {data} = await autoFetch.post(
                    `/api/post/upload-image`,
                    formData
                );
                image = {url: data.url, public_id: data.public_id};
            }

            const {data} = await autoFetch.post(`api/post/create-post`, {
                text,
                image,
                title
            });
            setPosts([data.post, ...posts]);
            toast.success(data?.msg || "Create new post successfully!");

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong. Try again!");
        }
        setLoadingCreateNewPost(false);
    };

    const PostInRight = () => {
        if (loading) {
            return <LoadingPost />;
        }
        if (posts.length) {
            return posts.map((p) => (
                <Post
                    key={p._id}
                    currentPost={p}
                    getDeletePostId={getDeletePostId}
                />
            ));
        }
        return (
            <div className='text-center w-full text-4xl dark:bg-[#242526] py-5 rounded-lg '>
                No post found
            </div>
        );
    };

    const form = () => {
        if (loading) {
            return <LoadingForm />;
        }
        return (
            <FormCreatePost
                setAttachment={setAttachment}
                setOpenModal={setOpenModal}
                text={text}
                user={user}
            />
        );
    };

    return (
        <div>
            {openModal && (
                <PostForm
                    setOpenModal={setOpenModal}
                    text={text}
                    setText={setText}
                    title={title}
                    setTitle={setTitle}
                    attachment={attachment}
                    setAttachment={setAttachment}
                    createNewPost={createNewPost}
                />
            )}

            {user._id === own._id && form()}
            <div className='mb-4'>
                {loadingCreateNewPost && <LoadingPost />}
            </div>
            {PostInRight()}
        </div>
    );
};

export default Main;
