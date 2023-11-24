import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {Modal, Post, LoadingPost, LoadingForm, FormCreatePost} from "../..";
import InfiniteScroll from "react-infinite-scroll-component";

const MyPost = ({
    posts,
    loading,
    token,
    user,
    getAllPosts,
    error,
    book,
}) => {

    // get posts
    useEffect(() => {
        if (token) {
            getAllPosts();
        }
    }, []);


    const content = () => {
        if (loading) {
            return (
                <div>
                    <LoadingPost />
                </div>
            );
        }
        if (error) {
            return (
                <div
                    className={`bg-white shadow-post
                    dark:bg-[#242526] rounded-lg w-full text-center text-xl font-bold py-10 `}>
                    <div>No post found... Try again!</div>
                </div>
            );
        }
        if (posts.length === 0) {
            return (
                <div className='w-full text-center text-xl font-semibold pt-[5vh] pb-[5vh] flex-col '>
                    <div>
                        Nothing to display
                    </div>
                </div>
            );
        }
        return (
            <div>
                 {posts.map((post) => (
                    <Post
                        key={post._id}
                        currentPost={post}
                        user_img={user.image.url}
                        userId={user._id}
                        className={"shadow-post"}
                        userRole={user.role}
                        book={book}
                    />
                ))}
            </div>
           
               
         
        );
    };


    return (
        <div className=''>
            {content()}
        </div>
    );
};

export default MyPost;
