import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Post, CreateBox, PostForm } from "../..";
import InfiniteScroll from "react-infinite-scroll-component";
import shuffle from "../../../utils/shuffle";
import NewsForm from "../../common/NewsForm";
import ReactLoading from "react-loading";
import HeaderMenu from "../../common/HeaderMenu";

const Main = ({ token, autoFetch, setOneState, user }) => {
  const [menu, setMenu] = useState("Following");
  const list = ["Following", "Discover"];

  const [postOpen, setPostOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  const [attachment, setAttachment] = useState("");
  const [newsAttachment, setNewsAttachment] = useState("");

  const initInput = {
    text: "",
    title: "",
    image: "",
    hashtag: [],
    spoiler: false,
  };
  const [input, setInput] = useState(initInput);
  const [newsInput, setNewsInput] = useState({
    text: "",
    title: "",
    image: "",
    hashtag: [],
    spoiler: false,
  });

  const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [activePosts, setActivePosts] = useState([]);
  const [reservedPosts, setReservedPosts] = useState([]);

  const [moreData, setmoreData] = useState(true);

  const [morePosts, setMorePosts] = useState(true);
  const [moreReviews, setMoreReviews] = useState(true);
  const [moreTrades, setMoreTrades] = useState(true);
  const [moreQuestions, setMoreQuestions] = useState(true);

  const [moreNews, setMoreNews] = useState(true);

  const [popularReviews, setPopularReviews] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [nearTrades, setNearTrades] = useState([]);
  const [suggestedPosts, setSuggestedPosts] = useState([]);

  const [location, setLocation] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (position.coords.latitude) {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    getFirstData();
    getDiscover();
  }, []);

  useEffect(()=>{
    console.log(page)
  },[page])

  useEffect(() => {
    if (location) getNearby();
  }, [location]);

  const createNewPost = async (formData) => {
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

      const { data } = await autoFetch.post(`api/post/create-post`, {
        text: input.text,
        image,
        title: input.title,
        hashtag: input.hashtag,
        spoiler: input.spoiler,
      });
      setActivePosts((prev) => [data.post, ...prev]);
      toast.success("Create new post successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    } finally {
      setLoadingCreateNewPost(false);
    }
  };

  const createNewNews = async (formData) => {
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
      console.log(user.role);
      const { data } = await autoFetch.post(`api/news/create`, {
        text: newsInput.text,
        title: newsInput.title,
        image,
        hashtag: newsInput.hashtag,
        type: user.role === 1 ? 1 : 0,
        spoiler: input.spoiler,
      });
      setActivePosts((prev) => [data.post, ...prev]);

      if (user.role === 1) toast.success("Create new news post successfully!");
      else
        toast.success(
          "An admin will verify your news post before it gets promoted"
        );
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    } finally {
      setLoadingCreateNewPost(false);
    }
  };

  const getFirstData = async () => {
    try {
      setPage((prev) => prev+1);
      const [posts, reviews, trades, news, questions] = await Promise.all([
        getPosts(),
        getReviews(),
        getTrades(),
        getNews(),
        getQuestions(),
      ]);
      let data = [...posts, ...reviews, ...trades, ...news, ...questions];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log(posts)
      console.log(reviews)
      console.log(trades)
      console.log(news)
      console.log(questions)

      let firstData = data.splice(0, 10);
      setActivePosts(firstData);
      setReservedPosts(data);
      if (!data.length) setmoreData(false);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getMoreData = async () => {
    try {
      setPage((prev) => prev+1);
      const [posts, reviews, trades, news, questions] = await Promise.all([
        getPosts(),
        getReviews(),
        getTrades(),
        getNews(),
        getQuestions(),
      ]);
      let data = [
        ...reservedPosts,
        ...posts,
        ...reviews,
        ...trades,
        ...news,
        ...questions,
      ];
      console.log(posts)
      console.log(reviews)
      console.log(trades)
      console.log(news)
      console.log(questions)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      let firstData = data.splice(0, 10);
      setActivePosts((prev) => [...prev, ...firstData]);
      setReservedPosts(data);
      if (!data.length) setmoreData(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getPosts = async () => {
    console.log(page)
    if (!morePosts) return [];
    const { data } = await autoFetch.get(
      `/api/post/following?page=${page+1}`
    );
    if (data.posts.length < 10) setMorePosts(false);
    if (data.posts.length === 0) return [];
    return data.posts;
  };

  const getReviews = async () => {
    console.log(page)

    if (!moreReviews) return [];
    const { data } = await autoFetch.get(
      `/api/review/following?page=${page + 1}`
    );
    if (data.posts.length < 10) setMoreReviews(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getTrades = async () => {
    console.log(page)

    if (!moreTrades) return [];
    const { data } = await autoFetch.get(
      `/api/trade/following?page=${page + 1}`
    );
    if (data.posts.length < 10) setMoreTrades(false);
    if (data.posts.length === 0) return [];

    return data.posts;
  };

  const getNews = async () => {
    console.log(page)

    if (!moreNews) return [];
    const { data } = await autoFetch.get(
      `/api/news/following?page=${page + 1}`
    );
    if (data.posts.length < 10) setMoreNews(false);
    if (data.posts.length === 0) return [];
    return data.posts;
  };

  const getQuestions = async () => {
    console.log(page)

    if (!moreQuestions) return [];
    const { data } = await autoFetch.get(
      `/api/question/following?page=${page + 1}`
    );
    if (data.posts.length < 10) setMoreQuestions(false);
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
        { data: postPop },
        { data: reviewPop },
      ] = await Promise.all([
        autoFetch.post(`/api/review/discover`, { suggestion: people }),
        autoFetch.post(`/api/post/discover`, { suggestion: people }),
        autoFetch.get("/api/post/popular"),
        autoFetch.get("/api/review/popular"),
      ]);

      console.log('pop',reviewPop)


      const popular_reviews = reviewPop.posts;
      const popular_posts = postPop.posts;
      const discover_reviews = reviewDis.posts || [];
      const discover_posts = postDis.posts || [];
      // const discover_trades = tradeDis.posts
      console.log(popular_reviews)

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

  useEffect(()=>{
    console.log("222")
    console.log(popularReviews)
  },[popularReviews])
  const getNearby = async () => {
    try {
      const { data } = await autoFetch.get(
        `/api/trade/get-nearby/${location.long}/${location.lat}`
      );
      setNearTrades(data.posts);
    } catch (e) {
      console.log(e);
    }
  };

  const Following = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
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
        next={getMoreData}
        hasMore={moreData}
      >
        {activePosts.map((post) => (
          <Post key={post._id} currentPost={post} />
        ))}
      </InfiniteScroll>
      // <div>{childComponent}</div>
    );
  };
  const childComponent = useMemo(() => <Following />, [activePosts]);

  const Discover = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    }

    return (
      <div>
        <div>Popular reviews</div>
        {popularReviews.map((post) => (
          <Post key={post._id} currentPost={post} />
        ))}
        <div>Popular posts</div>
        {popularPosts.map((post) => (
          <Post key={post._id} currentPost={post} />
        ))}
        <div>Nearby trades</div>
        {nearTrades.map((post) => (
          <Post key={post._id} currentPost={post} />
        ))}
        <div>Suggested posts</div>
        {suggestedPosts.map((post) => (
          <Post key={post._id} currentPost={post} />
        ))}
      </div>
    );
  };

  return (
    <div className="">
      <CreateBox
        setOpenForm={setPostOpen}
        setOpenNews={setNewsOpen}
        user={user}
        allowNews={true}
        text="post"
      />

      {postOpen && (
        <PostForm
          setOpenModal={setPostOpen}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          createNewPost={createNewPost}
          initInput={initInput}
        />
      )}

      {newsOpen && (
        <NewsForm
          setOpenModal={setNewsOpen}
          input={newsInput}
          setInput={setNewsInput}
          attachment={newsAttachment}
          setAttachment={setNewsAttachment}
          createNewPost={createNewNews}
        />
      )}

      <div className="flex">
        <HeaderMenu list={list} menu={menu} handler={setMenu} />
      </div>

      {loadingCreateNewPost && (
        <div className="flex justify-center">
          <ReactLoading type="bubbles" width={64} height={64} color="white" />
        </div>
      )}

      {/* {menu === "Following" && <Following />} */}
      {menu === "Following" && <div>{childComponent}</div>}

      {menu === "Discover" && <Discover />}
    </div>
  );
};

export default Main;
