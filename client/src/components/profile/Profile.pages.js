import React from "react";
import {useAppContext} from "../../context/useContext";
import {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ReactLoading from "react-loading";
//components
import Header from "./components/Header";
import Details from "./components/Details";
import Main from "./components/Main";
import {LoadingProfile} from "../";
import FollowerPage from "./components/FollowerPage";
import FollowingPage from "./components/FollowingPage";
import Shelves from "./components/Shelves";
import ShelfDetail from "./components/ShelfDetail";
import Diary from "./components/Diary";
import Points from "./components/Points";

const Profile = () => {
    const navigate = useNavigate();
    const { id: currentUserId, shelf } = useParams()
    const location = useLocation();

    // Get the search string from the location object
    const searchParams = new URLSearchParams(location.search);
   
    // const isSearch = location.pathname.includes('/search')
    const tabView = searchParams.get('view') || "posts";

    const {
        dark,
        autoFetch,
        setOneState,
        user: own,
        setNameAndToken,
        token,
        socket
    } = useAppContext();
    const [postLoading, setPostLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
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
        featuredShelf:{books: []}
    });
    const [recent,setRecent] = useState([])
  

    useEffect(() => {
        const getData = async()=>{
            setLoading(true)
            try{
                await getCurrentUser(currentUserId);
                await getRecent(currentUserId)
            } catch(e){
                console.log(e)
            }
            setLoading(false)
      
        }
      getData()
    }, [currentUserId]);

    const getCurrentUser = async (userId) => {
        setLoading(true);
        try {
            const {data} = await autoFetch.get(`/api/auth/${userId}`);
            console.log(data.user)
            setUser(data.user);

        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const getRecent = async (userId) => {
        try {
            const {data} = await autoFetch.get(`/api/review/recent/${userId}`);
            // console.log(data.user)
            setRecent(data.books);
            console.log(data.books)

        } catch (error) {
            console.log(error);
        }
    };


    const main = () => {
        if(shelf) {
            
            return (
            <ShelfDetail 
            dark={dark}
            userId={currentUserId}
            autoFetch={autoFetch}
            own={own}
            navigate={navigate}
            setNameAndToken={setNameAndToken}
            token={token}
            shelfId={shelf}/>
        )}
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
            <div className='w-full sm:grid grid-cols-5 gap-x-4 '>
                
                <div className='col-span-3 '>
                    <Main
                        autoFetch={autoFetch}
                        dark={dark}
                        own={own}
                        user={user}
                        setOneState={setOneState}
                        loading={postLoading}
                        // posts={activePosts}
                        // setPosts={setActivePosts}
                    />
                </div>
                <div className='col-span-2 sticky top-20 self-start'>
                    <Details
                       data={user?.featuredShelf?.books}
                       name={user?.featuredShelf?.name}
                    />
                      <Details
                       data={recent}
                       name="Recent"
                    />
                </div>
            </div>
        );
    };

    if (loading)
    return <div className="w-screen min-h-screen bg-mainbg flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>

    return (
        <div className='min-h-screen w-screen bg-mainbg pb-7 '>
            <div className="flex justify-center w-full">
                <Header
                    user={user}
                    own={own}
                    navigate={navigate}
                    autoFetch={autoFetch}
                    setNameAndToken={setNameAndToken}
                    token={token}
                    tabView={tabView}
                    socket={socket}
                    currentUserId={currentUserId}
                />
            </div>
          

            <div className='mx-4 sm:mx-[5%] md:mx-[15%] mt-4 '>
                {main()}
            </div>
        </div>
    );
};

export default Profile;
