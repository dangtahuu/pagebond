import React from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactLoading from "react-loading";
//components
import Header from "./components/Header";
import Details from "./components/Details";
import Main from "./components/Main";
import FollowerPage from "./components/FollowerPage";
import FollowingPage from "./components/FollowingPage";
import Shelves from "./components/Shelves";
import ShelfDetail from "./components/ShelfDetail";
import Diary from "./components/Diary";
import Points from "./components/Points";
import Challenge from "./components/Challenge";
import Saved from "./components/Saved";

const Profile = () => {
  const navigate = useNavigate();
  const { id: currentUserId, shelf } = useParams();
  const location = useLocation();

  // Get the search string from the location object
  const searchParams = new URLSearchParams(location.search);

  // const isSearch = location.pathname.includes('/search')
  const tabView = searchParams.get("view") || "posts";

  const {
    dark,
    autoFetch,
    user: own,
    setNameAndToken,
    token,
    socket,
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    image: {
      url: "",
    },
    name: "",
    // username: "",
    about: "",
    _id: currentUserId,
    follower: [],
    following: [],
    featuredShelf: { books: [] },
  });

  const [numberOfBooks, setNumberOfBooks] = useState("");
  const [numberOfPosts, setNumberOfPosts] = useState("");
  const [challenge, setChallenge] = useState({
    year: "",
    number: "",
    progress: "",
  });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        await getCurrentUser(currentUserId);
        await getRecent(currentUserId);
        await getNumberOfBooks(currentUserId);
        await getNumberOfPosts(currentUserId);
        await getChallenge(currentUserId);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    getData();
  }, [currentUserId]);

  const getCurrentUser = async (userId) => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/auth/${userId}`);
      console.log(data.user);
      setUser(data.user);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const getRecent = async (userId) => {
    try {
      const { data } = await autoFetch.get(`/api/review/recent/${userId}`);
      // console.log(data.user)
      setRecent(data.books);
      console.log(data.books);
    } catch (error) {
      console.log(error);
    }
  };

  const getNumberOfBooks = async (userId) => {
    try {
      const { data } = await autoFetch.get(
        `/api/review/number-of-books/${userId}`
      );
      // console.log(data.user)
      setNumberOfBooks(data.number);
    } catch (error) {
      console.log(error);
    }
  };

  const getNumberOfPosts = async (userId) => {
    try {
      const { data } = await autoFetch.get(
        `/api/post/number-with-user/${userId}`
      );
      setNumberOfPosts(data.number);
    } catch (error) {
      console.log(error);
    }
  };

  const getChallenge = async (userId) => {
    try {
      const currentDate = new Date();

      const currentYear = currentDate.getFullYear();
      const { data } = await autoFetch.get(
        `/api/review/year-stats/${userId}/${currentYear}`
      );

      setChallenge({
        year: currentYear,
        number: data.challenge.number,
        progress: data.number,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const main = () => {
    if (shelf) {
      return (
        <ShelfDetail
          dark={dark}
          userId={currentUserId}
          autoFetch={autoFetch}
          own={own}
          navigate={navigate}
          setNameAndToken={setNameAndToken}
          token={token}
          shelfId={shelf}
        />
      );
    }
    if (tabView === "following") {
      return (
        <FollowingPage
          dark={dark}
          userId={currentUserId}
          autoFetch={autoFetch}
          own={own}
          navigate={navigate}
          setNameAndToken={setNameAndToken}
          token={token}
        />
      );
    }
    if (tabView === "follower") {
      return (
        <FollowerPage
          dark={dark}
          userId={user._id}
          autoFetch={autoFetch}
          navigate={navigate}
          own={own}
          setNameAndToken={setNameAndToken}
          token={token}
        />
      );
    }
    if (tabView === "shelves") {
      return (
        <Shelves
          dark={dark}
          userId={user._id}
          autoFetch={autoFetch}
          navigate={navigate}
          own={own}
          setNameAndToken={setNameAndToken}
          token={token}
        />
      );
    }

    if (tabView === "diary") {
      return (
        <Diary
          dark={dark}
          userId={user._id}
          autoFetch={autoFetch}
          navigate={navigate}
          own={own}
          setNameAndToken={setNameAndToken}
          token={token}
        />
      );
    }

    if (tabView === "points") {
      return (
        <Points
          dark={dark}
          user={user}
          autoFetch={autoFetch}
          navigate={navigate}
          own={own}
          setNameAndToken={setNameAndToken}
          token={token}
          setUser={setUser}
        />
      );
    }

    return (
      <div className="w-full sm:grid grid-cols-5 gap-x-4 ">
        <div className="col-span-3 ">
          {tabView === "posts" &&  <Main own={own} user={user} />}
          {tabView === "saved" && <Saved own={own} user={user} />}
         
        </div>
        <div className="col-span-2 flex flex-col gap-y-3">
          <Challenge challenge={challenge} setChallenge={setChallenge} />
          <Details
            data={user?.featuredShelf?.books}
            name={user?.featuredShelf?.name}
          />
          <div className="sticky top-20">
          <Details data={recent} name="Recent" />
          </div>
         
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="w-screen min-h-screen bg-mainbg flex justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );

  return (
    <div className="min-h-screen w-screen bg-mainbg pb-7 ">
      <div className="flex justify-center w-full">
        <Header
          user={user}
          own={own}
          tabView={tabView}
          socket={socket}
          currentUserId={currentUserId}
          numberOfBooks={numberOfBooks}
          numberOfPosts={numberOfPosts}
        />
      </div>

      <div className="mx-4 sm:mx-[5%] md:mx-[15%] mt-4 ">{main()}</div>
    </div>
  );
};

export default Profile;
