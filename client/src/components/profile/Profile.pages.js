import React from "react";
import {useAppContext} from "../../context/useContext";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

//components
import Header from "./components/Header";
import Details from "./components/Details";
import Main from "./components/Main";
import {LoadingProfile} from "../";
import FollowerPage from "./components/FollowerPage";
import FollowingPage from "./components/FollowingPage";
import Shelves from "./components/Shelves";
import ShelfDetail from "./components/ShelfDetail";
const Profile = () => {
    const navigate = useNavigate();
    const { id: currentUserId, shelf } = useParams()

    const {
        dark,
        autoFetch,
        setOneState,
        user: own,
        setNameAndToken,
        token,
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
    });
    const [menu, setMenu] = useState("Posts");
    useEffect(() => {
        getCurrentUser(currentUserId);
        getPostWithUserId(currentUserId);
    if(shelf) setMenu("Shelves")

        else setMenu("Posts");
        setImages([]);
    }, [currentUserId]);

    const getCurrentUser = async (userId) => {
        setLoading(true);
        try {
            const {data} = await autoFetch.get(`/api/auth/${userId}`);
            setUser(data.user);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const getPostWithUserId = async (userId) => {
        setPostLoading(true);
        try {
            const {data} = await autoFetch.get(
                `/api/post/getPostWithUser/${userId}`
            );
            setPosts(data.posts);
        } catch (error) {
            console.log(error);
        }
        setPostLoading(false);
    };
    useEffect(() => {
        if (posts.length) {
            setImages(
                posts.filter((p) => p.type==3)
            );
        }
    }, [posts]);

    const getDeletePostId = (postId) => {
        // @ts-ignore
        const newPosts = posts.filter((v) => v._id !== postId);
        // @ts-ignore
        setPosts(newPosts);
        console.log("delete post: ", postId);
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
            shelf={shelf}/>
        )}
        if (menu === "Following") {
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
        if (menu === "Follower") {
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
        if (menu === "Shelves") {
            return (
                <Shelves
                    dark={dark}
                    userId={user._id}
                    autoFetch={autoFetch}
                    navigate={navigate}
                    own={own}
                    setNameAndToken={setNameAndToken}
                    token={token}
                    setMenu={setMenu}
                />
            );
        }
        return (
            <div className='w-full sm:grid grid-cols-5 gap-x-4 '>
                <div className='col-span-2 sticky top-20 self-start'>
                    <Details
                        user={user}
                        own={own}
                        images={images}
                        navigate={navigate}
                        autoFetch={autoFetch}
                        dark={dark}
                        profileLoading={loading}
                        postLoading={postLoading}
                    />
                </div>
                <div className='col-span-3 '>
                    <Main
                        autoFetch={autoFetch}
                        dark={dark}
                        own={own}
                        user={user}
                        setOneState={setOneState}
                        loading={postLoading}
                        posts={posts}
                        setPosts={setPosts}
                        getDeletePostId={getDeletePostId}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className='min-h-screen w-[99.5vw] bg-mainbg pb-7 '>
            {!loading ? (
                <Header
                    user={user}
                    own={own}
                    navigate={navigate}
                    setMenu={setMenu}
                    menu={menu}
                    autoFetch={autoFetch}
                    setNameAndToken={setNameAndToken}
                    token={token}
                />
            ) : (
                <LoadingProfile />
            )}

            <div className='mx-4 sm:mx-[5%] md:mx-[15%] mt-4 '>
                {main()}
            </div>
        </div>
    );
};

export default Profile;
