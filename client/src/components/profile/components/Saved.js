import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useAppContext } from "../../../context/useContext";
import { toast } from "react-toastify";

// components
import { Post, CreateBox, ReviewForm } from "../..";
import InfiniteScroll from "react-infinite-scroll-component";

const Saved = ({ own, user }) => {
  const { autoFetch } = useAppContext();

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);

  const [posts, setPosts] = useState([]);
  const [morePosts, setMorePosts] = useState(true);

  useEffect(() => {
    getPosts();
  }, [user]);

  const getPosts = async () => {
    try {
      if (!morePosts) return [];
      const { data } = await autoFetch.get(
        `/api/post/saved?page=${page + 1}`
      );
      setPage((prev) => prev + 1);
      if (data.posts.length < 10) setMorePosts(false);
      setPosts((prev) => [...prev, ...data.posts]);
    } catch (e) {
      console.log(e);
    } finally{
    setLoading(false);

    }
  };

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
          <div>You haven't saved anything!</div>
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

export default Saved;
