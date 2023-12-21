import React, {useEffect, useState} from "react";
import ReactLoading from "react-loading";
import { useAppContext } from "../../../context/useContext";
import {toast} from "react-toastify";

// components
import {LoadingPost, Modal, Post, LoadingForm, CreateBox, PostForm} from "../..";
import InfiniteScroll from "react-infinite-scroll-component";
import NewsForm from "../../common/NewsForm";

const Main = ({
    own,
    user,
}) => {
    const {autoFetch}= useAppContext()
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
        spoiler: false
    
      });
      const [postOpen, setPostOpen] = useState(false);
      const [newsOpen, setNewsOpen] = useState(false);
    
      const [attachment, setAttachment] = useState("");
      const [newsAttachment, setNewsAttachment] = useState("");
    const [loading, setLoading] = useState(false)

    const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

    const [page, setPage] = useState(0);

    const [activePosts, setActivePosts] = useState([]);
    const [reservedPosts, setReservedPosts] = useState([]);
  
    const [moreData, setmoreData] = useState(true);
  
    const [morePosts, setMorePosts] = useState(true);
    const [moreReviews, setMoreReviews] = useState(true);
    const [moreTrades, setMoreTrades] = useState(true);
    const [moreQuestions, setMoreQuestions] = useState(true);
  
    const [moreNewss, setMoreNewss] = useState(true)

    useEffect(()=>{
        getFirstData()
    },[])

    const getFirstData = async () => {
        setLoading(true)
        try {
          const [posts, reviews, trades, news, questions] = await Promise.all([
            getPosts(),
            getReviews(),
            getTrades(),
            getNews(),
            getQuestions()
          ]);
          let data = [...posts, ...reviews, ...trades, ...news,...questions];
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          let firstData = data.splice(0, 10);
          setActivePosts(firstData);
          setReservedPosts(data);
          setPage((prev) => prev++);
          if (!data.length) setmoreData(false);
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false);
        }
      };
    
      const getMoreData = async () => {
        try {
          const [posts, reviews, trades, news, questions] = await Promise.all([
            getPosts(),
            getReviews(),
            getTrades(),
            getNews(),
            getQuestions()
          ]);
          let data = [
            ...reservedPosts,
            ...posts,
            ...reviews,
            ...trades,
            ...news,
            ...questions
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
    
      const getPosts = async () => {
        console.log(user)
        console.log(user._id)
        if (!morePosts) return [];
        const { data } = await autoFetch.get(
          `/api/post/withUser/${user._id}?page=${page + 1}`
        );
        if (data.posts.length < 10) setMorePosts(false);
        if (data.posts.length === 0) return [];
        return data.posts;
      };
    
      const getReviews = async () => {
        if (!moreReviews) return [];
        const { data } = await autoFetch.get(
          `/api/review/withUser/${user._id}?page=${page + 1}`
        );
        if (data.posts.length < 10) setMoreReviews(false);
        if (data.posts.length === 0) return [];
    
        return data.posts;
      };
    
      const getTrades = async () => {
        if (!moreTrades) return [];
        const { data } = await autoFetch.get(
          `/api/trade/withUser/${user._id}?page=${page + 1}`
        );
        if (data.posts.length < 10) setMoreTrades(false);
        if (data.posts.length === 0) return [];
    
        return data.posts;
      };
    
      const getNews= async () => {
        if (!moreNewss) return [];
        const { data } = await autoFetch.get(
          `/api/news/withUser/${user._id}?page=${page + 1}`
        );
        if (data.posts.length < 10) setMoreNewss(false);
        if (data.posts.length === 0) return [];
        return data.posts;
      };
    
      const getQuestions = async () => {
        if (!moreQuestions) return [];
        const { data } = await autoFetch.get(
          `/api/question/withUser/${user._id}?page=${page + 1}`
        );
        if (data.posts.length < 10) setMoreQuestions(false);
        if (data.posts.length === 0) return [];
        return data.posts;
      };

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
            spoiler: input.spoiler
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
            spoiler: input.spoiler
          });
          setActivePosts((prev) => [data.post, ...prev]);
    
          if (user.role === 1)
            toast.success("Create news successfully!");
          else
            toast.success(
              "An admin will verify your news before it gets promoted"
            );
        } catch (error) {
          console.log(error);
          toast.error(error.response.data.msg || "Something went wrong");
        } finally {
          setLoadingCreateNewPost(false);
        }
      };

    const PostInRight = () => {
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
          );
    };


    return (
        <div>
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

            {user._id === own._id && 
             <CreateBox
             setOpenForm={setPostOpen}
             setOpenNews={setNewsOpen}
             user={user}
             allowNews={true}
             text="post"
           />}

{loadingCreateNewPost && (
        <div className="flex justify-center">
          <ReactLoading type="bubbles" width={64} height={64} color="white" />
        </div>
      )}
        
            {PostInRight()}
        </div>
    );
};

export default Main;
