import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Modal,
  Post,
  LoadingPost,
  LoadingForm,
  CreateBox,
  ReviewForm,
  TradeForm,
} from "../..";
import QuestionForm from "../../common/QuestionForm";

const Question = ({
  posts,
  loading,
  token,
  autoFetch,
  setOneState,
  user,
  getAllPosts,
  setPosts,
  getNewPosts,
  error,
  book,
  moreTrades,
}) => {
  const [attachment, setAttachment] = useState("");

  const [input, setInput] = useState({
    title: "",
    text: "",
    image: "",
    hashtag: []
  });

  const [openModal, setOpenModal] = useState(false);
  const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

  // get posts
  useEffect(() => {
    if (token) {
      getAllPosts();
    }
  }, [book]);

  useEffect(() => {
    console.log(posts);
  }, [posts]);

  const createNewQuestion = async (formData) => {
    setLoadingCreateNewPost(true);
    let id;
    try {
      let image = null;
      if (formData) {
        const { data } = await autoFetch.post(
          `/api/post/upload-image`,
          formData
        );
        image = { url: data.url, public_id: data.public_id };
      }

      const { data } = await autoFetch.post(`api/question/create`, {
        text: input.text,
        title: input.title,
        book,
        image,
        hashtag: input.hashtag
      });
      id = data.post._id;
      // newArray = [data.post, ...posts]
      setPosts((prev) => [data.post, ...prev]);
      toast.success(data?.msg || "Create new question successfully!");
    } catch (error) {
      console.log(error);

      toast.error(error.response.data.msg || "Something went wrong");
    }
    setLoadingCreateNewPost(false);
    await addCommentAI(id)
  };

  const addCommentAI = async (id) => {
    console.log("addding");
    let newArray = [...posts]
    try {
      const { data: newComment } = await autoFetch.put(
        `api/question/add-comment-ai`,
        {
          text: input.text,
          title: input.title,
          // postId: posts[0]._id,
          postId: id,

          book,
        }
      );
        newArray[0].comments = newComment.post.comments
      setPosts(newArray)
    } catch (e) {
      console.log(e);
    }
  };

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
                    dark:bg-[#242526] rounded-lg w-full text-center text-xl font-bold py-10 `}
        >
          <div>No post found... Try again!</div>
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
      // <InfiniteScroll
      // className="!overflow-visible"
      //     dataLength={posts.length}
      //     next={getNewPosts}
      //     hasMore={true}
      //     loader={<LoadingPost />}>
      <div>

{/* {posts.map((post) => (
       <div>{post.comments[0]?.text || "Nothing"}</div>
        ))} */}

        
        {posts.map((post) => (
          <Post
            key={post._id}
            currentPost={post}
            className={"shadow-post"}
            book={book}
          />
        ))}
        {moreTrades && (
          <div
            className="text-sm cursor-pointer text-smallText block w-[100px] text-center mx-auto "
            onClick={getNewPosts}
          >
            LOAD MORE
          </div>
        )}
      </div>

      // </InfiniteScroll>
    );
  };

  const form = () => {
    if (error) {
      return <></>;
    }
    if (loading) return <LoadingForm />;
    return (
      <CreateBox
        setAttachment={setAttachment}
        setOpenForm={setOpenModal}
        user={user}
      />
    );
  };

  return (
    <div className="">
      {form()}

      {openModal && (
        <QuestionForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          createNewPost={createNewQuestion}
          addCommentAI={addCommentAI}
        />
      )}
      {loadingCreateNewPost && <LoadingPost className="mb-4" />}
      {content()}
    </div>
  );
};

export default Question;
