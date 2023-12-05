import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
    // Modal, 
    Post, LoadingPost, LoadingForm, FormCreatePost, PostForm } from "../..";
import InfiniteScroll from "react-infinite-scroll-component";

const Main = ({ token, autoFetch, setOneState, user }) => {
  const [attachment, setAttachment] = useState("");
  const [specialAttachment, setSpecialAttachment] = useState("");

  const [text, setText] = useState("");
  const [title, setTitle] = useState("");

  const [specialInput, setSpecialInput] = useState({
    text:"",
    title:"",
    image:"",
  })

  const [page,setPage] = useState(1)

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [morePosts, setMorePosts] = useState(true);
  const [moreReviews, setMoreReviews] = useState(true);
  const [moreTrades, setMoreTrades] = useState(true);
  const [moreSpecialPosts, setMoreSpecialPosts] = useState(true);

  const [activePosts, setActivePosts] = useState([]);
  const [reservedPosts, setReservedPosts] = useState([]);
  const [moreData, setmoreData] = useState(true);

  const [postModal, setPostModal] = useState(false);
  const [specialPostOpen, setSpecialPostOpen] = useState(false);

  const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);


  // get posts
  useEffect(() => {
    getFirstData();
    // console.log('i fire once');
  }, []);

  const createNewPost = async (formData) => {
    setLoadingCreateNewPost(true);
    if (!text) {
      toast.error("You must type something...");
      return;
    }
    try {
      let image = null;
      if (formData) {
        const { data } = await autoFetch.post(
          `/api/post/upload-image`,
          formData
        );
        image = { url: data.url, public_id: data.public_id };
      }

      const { data } = await autoFetch.post(`api/post/create-post`, {
        text,
        image,
        title,
      });
      setActivePosts((prev) => [data.post, ...prev]);
      toast.success(data?.msg || "Create post successfully!");
    } catch (error) {
      console.log(error);
    }
    setLoadingCreateNewPost(false);
  };


  const createNewSpecialPost = async (formData) => {
    setLoadingCreateNewPost(true);
    if (!text) {
      toast.error("You must type something...");
      return;
    }
    try {
      let image = null;
      if (formData) {
        const { data } = await autoFetch.post(
          `/api/post/upload-image`,
          formData
        );
        image = { url: data.url, public_id: data.public_id };
      }

      const { data } = await autoFetch.post(`api/special/create`, {
        text: specialInput.text, 
        title: specialInput.title, 
        image,
        type: user.role === 1 ? 1: 2,
          });
      setActivePosts((prev) => [data.post, ...prev]);
      toast.success(data?.msg || "Create new special post successfully!");
    } catch (error) {
      console.log(error);
    }
    setLoadingCreateNewPost(false);
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
        <div className={`w-full text-center text-xl font-bold py-10 `}>
          <div>No post found... Try again!</div>
        </div>
      );
    }
    if (activePosts.length === 0) {
      return (
        <div className="w-full text-center text-xl font-bold pt-[20vh] ">
          <div>Nothing to display</div>
        </div>
      );
    }
    return (
      <InfiniteScroll
        dataLength={activePosts.length}
        next={getNewData}
        hasMore={moreData}
      >
        {activePosts.map((post) => (
          <Post
            key={post._id}
            currentPost={post}
            user_img={user.image.url}
            userId={user._id}
            userRole={user.role}
          />
        ))}
      </InfiniteScroll>
    );
  };

  const form = () => {
    if (error) {
      return <></>;
    }
    if (loading) return <LoadingForm />;
    return (
      <FormCreatePost
        setAttachment={setAttachment}
        setOpenModal={setPostModal}
        setSpecialPostOpen={setSpecialPostOpen}
        text={text}
        user={user}
      />
    );
  };

  //   const getFirstData = async() => {
  //     console.log('aaaa')
  //   }

  const getFirstData = async () => {
    console.log("aaaaa");
    try {
      const [posts, reviews, trades, special] = await Promise.all([
        getFirstPosts(),
        getFirstReviews(),
        getFirstTrades(),
        getFirstSpecial(),
      ]);
      let data = [...posts, ...reviews, ...trades, ...special];
      console.log(data);
      console.log(posts);
      console.log(reviews);
      console.log(trades);
      console.log(special);
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      let firstData = data.splice(0, 10);
      setActivePosts(firstData);
      setReservedPosts(data);
      if (!data.length) setmoreData(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getNewData = async () => {
    try {
      const [posts, reviews, trades, special] = await Promise.all([
        getNewPosts(),
        getNewReviews(),
        getNewTrades(),
        getNewSpecial(),
      ]);
      let data = [
        ...reservedPosts,
        ...posts,
        ...reviews,
        ...trades,
        ...special,
      ];
      setPage((prev)=>prev++)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      let firstData = data.splice(0, 10);
      setActivePosts((prev) => [...prev, ...firstData]);
      setReservedPosts(data);
      if (!data.length) setmoreData(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getFirstPosts = async () => {
    console.log("bbbbbb");
    const { data } = await autoFetch.get(`/api/post/following?page=1`);
    if (data.posts.length < 10) setMorePosts(false);
    if (data.posts.length === 0) return [];
    return data.posts;
  };

  const getNewPosts = async () => {
    if (!morePosts) return [];
    const { data } = await autoFetch.get(
      `/api/post/following?page=${page + 1}`
    );
    console.log("222222");
    console.log(data.posts);
    if (data.posts.length < 10) setMorePosts(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getFirstReviews = async () => {
    const { data } = await autoFetch.get(`/api/review/following?page=1`);
    if (data.posts.length < 10) setMoreReviews(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getNewReviews = async () => {
    if (!moreReviews) return [];
    const { data } = await autoFetch.get(
      `/api/review/following?page=${page + 1}`
    );
    if (data.posts.length < 10) setMoreReviews(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getFirstTrades = async () => {
    const { data } = await autoFetch.get(`/api/trade/following?page=1`);
    if (data.posts.length < 10) setMoreTrades(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getNewTrades = async () => {
    if (!moreTrades) return [];
    const { data } = await autoFetch.get(
      `/api/trade/following?page=${page + 1}`
    );
    if (data.posts.length < 10) setMoreTrades(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getFirstSpecial = async () => {
    const { data } = await autoFetch.get(`/api/special/following?page=1`);
    if (data.posts.length < 10) setMoreSpecialPosts(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getNewSpecial = async () => {
    if (!moreSpecialPosts) return [];
    const { data } = await autoFetch.get(
      `/api/special/following?page=${page + 1}`
    );
    if (data.posts.length < 10) setMoreSpecialPosts(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  return (
    <div className="">
      {form()}

      {/* {postModal && (
        <Modal
          setOpenModal={setPostModal}
          text={text}
          setText={setText}
          title={title}
          setTitle={setTitle}
          attachment={attachment}
          setAttachment={setAttachment}
          createNewPost={createNewPost}
        />
      )} */}

            {specialPostOpen && (
                <PostForm
                    setOpenModal={setSpecialPostOpen}
                  input={specialInput}
                  setInput={setSpecialInput}
                    attachment={specialAttachment}
                    setAttachment={setSpecialAttachment}
                    createNewPost={createNewSpecialPost}
                    type={2}
                />
            )}

      {loadingCreateNewPost && <LoadingPost className="mb-4" />}
      {content()}
    </div>
  );
};

export default Main;
