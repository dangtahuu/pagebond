import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Post, CreateBox } from "../..";
import QuestionForm from "../../common/QuestionForm";
import ReactLoading from "react-loading";

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
  morePosts,
}) => {
  const [attachment, setAttachment] = useState("");

  const initInput = {
    title: "",
    text: "",
    image: "",
    hashtag: [],
    spoiler: false,
  }
  const [input, setInput] = useState(initInput);

  const [openModal, setOpenModal] = useState(false);
  const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

  useEffect(() => {
    if (token) {
      getAllPosts();
    }
  }, [book]);


  const createNewQuestion = async (formData) => {
    setLoadingCreateNewPost(true);
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
        hashtag: input.hashtag,
        spoiler: input.spoiler

      });
      setPosts((prev) => [data.post, ...prev]);
      toast.success(data?.msg || "Create new question successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
    setLoadingCreateNewPost(false);
  };

  const Content = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
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
            className={"shadow-post"}
            book={book}
          />
        ))}
        {morePosts && (
          <div
            className="text-sm cursor-pointer text-smallText block w-[100px] text-center mx-auto "
            onClick={getNewPosts}
          >
            LOAD MORE
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      <CreateBox
        setAttachment={setAttachment}
        setOpenForm={setOpenModal}
        user={user}
      />

      {openModal && (
        <QuestionForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          createNewPost={createNewQuestion}
          initInput={initInput}
        />
      )}

      {loadingCreateNewPost && (
        <div className="flex justify-center main-bg">
          <ReactLoading type="bubbles" width={64} height={64} color="white" />
        </div>
      )}

      <Content/>
    </div>
  );
};

export default Question;
