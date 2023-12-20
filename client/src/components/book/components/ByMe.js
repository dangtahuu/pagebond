import React, { useEffect, useState } from "react";
import {
  Post,
} from "../..";
import ReactLoading from "react-loading";

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


  if (loading) {
    return (
      <div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>
    );
  }

  if (posts.length === 0) {
    return (
        <div className='w-full text-center text-xl font-semibold pt-[5vh] pb-[5vh] flex-col '>
            <div>
                There's nothing here at the momment
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
        book={book}
      />
    ))}

  </div>

  );
};

export default ByMe;
