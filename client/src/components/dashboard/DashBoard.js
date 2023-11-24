import { useAppContext } from "../../context/useContext";
import { useNavigate } from "react-router-dom";
import News from "./components/News";
import Main from "./components/Main";
import Suggestion from "./components/Suggestion";
import NearYou from "./components/NearYou";
import { useState, useEffect } from "react";
import React from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    autoFetch,
    user,
    token,
    dark,
    setNameAndToken,
    setOneState,
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState({});

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position.coords.latitude);
        if(position.coords.latitude) {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });}
      })
    }
  }, []);



  const getAllPosts = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/post/news-feed?page=1&perPage=5`
      );
      setPosts(data.posts);
    } catch (error) {
      console.log(error);
      setError(true);
    }
    setLoading(false);
  };

  const getNewPosts = async () => {
    try {
      const { data } = await autoFetch.get(
        `/api/post/news-feed?page=${page + 1}&perPage=5`
      );
      setPage(page + 1);
      // @ts-ignore
      setPosts([...posts, ...data.posts]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen overflow-clip pt-16 md:pt-[85px]  ">
      <div className="w-screen grid grid-cols-11 md:gap-x-8 px-3 sm:px-7 md:px-10 relative ">
        <div className="hidden lg:block lg:col-span-3 relative lg:order-1">
       
          <News
            className=""
            autoFetch={autoFetch}
            dark={dark}
            token={token}
            error={error}
          />
        </div>
        <div className="col-span-11 order-2 md:col-span-7 lg:col-span-5 shrink-0 md:order-1 lg:order-2 ">
       
          <Main
            autoFetch={autoFetch}
            dark={dark}
            setOneState={setOneState}
            token={token}
            user={user}
            getAllPosts={getAllPosts}
            loading={loading}
            posts={posts}
            setPosts={setPosts}
            getNewPosts={getNewPosts}
            error={error}
          />
        </div>
        <div className="col-span-11 order-1 md:col-span-4 lg:col-span-3 md:order-2 lg:order-3 ">
          <Suggestion
            autoFetch={autoFetch}
            getAllPosts={getAllPosts}
            navigate={navigate}
            setNameAndToken={setNameAndToken}
            user={user}
            token={token}
            dark={dark}
            error={error}
          />
          {location.longitude && <NearYou 
          autoFetch={autoFetch}
          location={location}
          dark={dark}
          token={token}
          error={error}
          />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
