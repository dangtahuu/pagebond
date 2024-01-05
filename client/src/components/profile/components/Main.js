import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useAppContext } from "../../../context/useContext";
import { toast } from "react-toastify";

// components
import { Post, CreateBox, ReviewForm } from "../..";
import InfiniteScroll from "react-infinite-scroll-component";

const Main = ({ own, user }) => {
  const { autoFetch } = useAppContext();

  const [openPost, setOpenPost] = useState(false);
  const [openNews, setOpenNews] = useState(false);

  const [loading, setLoading] = useState(true);

  const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

  const [page, setPage] = useState(0);

  const [posts, setPosts] = useState([]);
  const [morePosts, setMorePosts] = useState(true);

  useEffect(() => {
    getPosts();
    setLoading(false);
  }, [user]);

  const getPosts = async () => {
    try {
      if (!morePosts) return [];
      const { data } = await autoFetch.get(
        `/api/post//withUser/${user._id}?page=${page + 1}`
      );
      setPage((prev) => prev + 1);
      if (data.posts.length < 10) setMorePosts(false);
      setPosts((prev) => [...prev, ...data.posts]);
    } catch (e) {
      console.log(e);
    }
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
        <div className="w-full text-center text-xl font-bold pt-[20vh] ">
          <div>Let's create your first post!</div>
        </div>
      );
    }
    return (
      <InfiniteScroll
        dataLength={posts.length}
        next={getPosts}
        hasMore={morePosts}
      >
        {posts.map((post) => (
          <Post key={post._id} currentPost={post} />
        ))}
      </InfiniteScroll>
    );
  };

  return (
    <div>
      {openPost && (
        <ReviewForm
          setOpenModal={setOpenPost}
          setPostLoading={setLoadingCreateNewPost}
          posts={posts}
          setPosts={setPosts}
          type="post"
        />
      )}

      {openNews && (
        <ReviewForm
          setOpenModal={setOpenNews}
          setPostLoading={setLoadingCreateNewPost}
          posts={posts}
          setPosts={setPosts}
          type="news"
        />
      )}

      {user._id === own._id && (
        <CreateBox
          setOpenForm={setOpenPost}
          setOpenNews={setOpenNews}
          user={user}
          allowNews={true}
          text="post"
        />
      )}

      {loadingCreateNewPost && (
        <div className="flex justify-center">
          <ReactLoading type="bubbles" width={64} height={64} color="white" />
        </div>
      )}

      <Content />
    </div>
  );
};

export default Main;
