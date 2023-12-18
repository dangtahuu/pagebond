import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Modal,
  Post,
  LoadingPost,
  LoadingForm,
  CreateBox,
  ReviewForm,
} from "../..";
import SpecialPostForm from "../../common/SpecialPostForm";

const ByMe = ({
  posts,
  loading,
  token,
  autoFetch,
  user,
  getAllPosts,
  book,
}) => {

  // get posts
  useEffect(() => {
    if (token) {
      getAllPosts();
    }
  }, [book]);

 

  const content = () => {
    if (loading) {
      return (
        <div>
          <LoadingPost />
        </div>
      );
    }
    if (posts.length === 0) {
      return (
        <div className="w-full text-center text-xl font-semibold pt-[5vh] pb-[5vh] flex-col ">
          <div>Nothing to display</div>
        </div>
      );
    }
    return (
      <div>
        {posts.map((post) => (
          <Post
            key={post._id}
            currentPost={post}
            className={"shadow-post"}
            book={book}
          />
        ))}

      </div>

    );
  };


  return (
    <div className="">
      
      {content()}
    </div>
  );
};

export default ByMe;
