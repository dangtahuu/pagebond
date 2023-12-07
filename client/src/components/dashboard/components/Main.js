import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  // Modal,
  Post,
  LoadingPost,
  LoadingForm,
  FormCreatePost,
  PostForm,
} from "../..";
import InfiniteScroll from "react-infinite-scroll-component";
import shuffle from "../../../utils/shuffle";

const Main = ({ token, autoFetch, setOneState, user }) => {
  const [attachment, setAttachment] = useState("");
  const [specialAttachment, setSpecialAttachment] = useState("");

  const [text, setText] = useState("");
  const [title, setTitle] = useState("");

  const [specialInput, setSpecialInput] = useState({
    text: "",
    title: "",
    image: "",
  });

  const [page, setPage] = useState(1);

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
  const [menu, setMenu] = useState("Following");
  const list = ["Following", "Discover"];

  const [popularReviews, setPopularReviews] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [nearTrades, setNearTrades] = useState([]);
  const [suggestedPosts, setSuggestedPosts] = useState([]);

  const [location, setLocation] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position.coords.latitude);
        if (position.coords.latitude) {
          console.log("0000000");
          console.log(position.coords.latitude);
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        }
      });
    }
  }, []);

  // get posts
  useEffect(() => {
    getFirstData();
    getDiscover();
    // console.log('i fire once');
  }, []);

  useEffect(() => {
    if (location) getNearby();

    // console.log('i fire once');
  }, [location]);

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
    if (!specialInput.text) {
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
      console.log(user.role);
      const { data } = await autoFetch.post(`api/special/create`, {
        text: specialInput.text,
        title: specialInput.title,
        image,
        type: user.role == 1 ? 1 : 2,
      });
      setActivePosts((prev) => [data.post, ...prev]);
      toast.success(data?.msg || "Create new special post successfully!");
    } catch (error) {
      console.log(error);
    }
    setLoadingCreateNewPost(false);
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
      setPage((prev) => prev++);
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

  const getDiscover = async () => {
    try {
      const { data } = await autoFetch.get(`/api/auth/find-people-to-follow`);
      let people = data.idsList;
      // const reviewPeople = people.splice(0,10)
      // const postPeople = people.splice(0,10)

      const [
        { data: reviewDis },
        { data: postDis },
        { data: tradeDis },
        { data: postPop },
        { data: reviewPop },
      ] = await Promise.all([
        autoFetch.post(`/api/review/discover`, { suggestion: people }),
        autoFetch.post(`/api/post/discover`, { suggestion: people }),
        autoFetch.post(`/api/trade/discover`, { suggestion: people }),
        autoFetch.get("/api/post/popular"),
        autoFetch.get("/api/review/popular"),
      ]);

      console.log(reviewDis.posts);
      console.log(postDis.posts);
      console.log(tradeDis.posts);
      console.log(postPop.posts);
      console.log(reviewPop.posts);

      const popular_reviews = reviewPop.posts;
      const popular_posts = postPop.posts;
      const discover_reviews = reviewDis.posts;
      const discover_posts = postDis.posts;
      // const discover_trades = tradeDis.posts

      const filtered_discover_reviews = discover_reviews.filter(
        (bItem) => !popular_reviews.some((aItem) => aItem._id === bItem._id)
      );
      const filtered_discover_posts = discover_posts.filter(
        (bItem) => !popular_posts.some((aItem) => aItem._id === bItem._id)
      );
      //   console.log('5555555555')
      // console.log(popular_reviews)
      setPopularReviews(popular_reviews);
      setPopularPosts(popular_posts);

      const discoverTotal = [
        ...filtered_discover_reviews,
        ...filtered_discover_posts,
      ];

      setSuggestedPosts(shuffle(discoverTotal));
    } catch (e) {
      console.log(e);
    }
  };

  const getNearby = async () => {
    try {
      // const location = await getLocation();

      //   const { data } = await autoFetch.get(`/api/auth/find-people-to-follow`)
      //   let people = data.idsList
      // const reviewPeople = people.splice(0,10)
      // const postPeople = people.splice(0,10)

      const { data } = await autoFetch.get(
        `/api/trade/get-nearby/${location.long}/${location.lat}`
      );

      setNearTrades(data.posts);
      console.log(data.posts);
    } catch (e) {
      console.log(e);
    }
  };



  const content1 = () => {
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

  const content2 = () => {
    // if (loading) {
    //   return (
    //     <div>
    //       <LoadingPost />
    //     </div>
    //   );
    // }
    // if (error) {
    //   return (
    //     <div className={`w-full text-center text-xl font-bold py-10 `}>
    //       <div>No post found... Try again!</div>
    //     </div>
    //   );
    // }
    // if (activePosts.length === 0) {
    //   return (
    //     <div className="w-full text-center text-xl font-bold pt-[20vh] ">
    //       <div>Nothing to display</div>
    //     </div>
    //   );
    // }
    return (
    <div>
      <div>popular reviews</div>
        {popularReviews.map((post) => (
          <Post
            key={post._id}
            currentPost={post}
            user_img={user.image.url}
            userId={user._id}
            userRole={user.role}
          />
        ))}
<div>popular posts</div>
{popularPosts.map((post) => (
          <Post
            key={post._id}
            currentPost={post}
            user_img={user.image.url}
            userId={user._id}
            userRole={user.role}
          />
        ))}
<div>near trades</div>
{nearTrades.map((post) => (
          <Post
            key={post._id}
            currentPost={post}
            user_img={user.image.url}
            userId={user._id}
            userRole={user.role}
          />
        ))}
<div>suggested posts</div>
{suggestedPosts.map((post) => (
          <Post
            key={post._id}
            currentPost={post}
            user_img={user.image.url}
            userId={user._id}
            userRole={user.role}
          />
        ))}
      </div>
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

      <div className="flex ">
        <ul className="flex items-center justify-start w-full py-1 mb-3 gap-x-5">
          {list.map((v) => (
            <li
              key={v + "button"}
              className={`li-profile ${menu === v && "active"} `}
              onClick={() => {
                setMenu(v);
                // navigate(`/profile/${user._id}`);
              }}
            >
              {v}
            </li>
          ))}
        </ul>
      </div>

      {menu==="Following" && content1()}
      {menu==="Discover" && content2()}

    </div>
  );
};

export default Main;
