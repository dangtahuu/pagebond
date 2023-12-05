import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {Modal, Post, LoadingPost, LoadingForm, FormCreatePost, ReviewForm, TradeForm} from "../..";
import InfiniteScroll from "react-infinite-scroll-component";

const Trade = ({
    posts,
    loading,
    token,
    autoFetch,
    setOneState,
    user,
    getAllPosts,
    setPosts,
    getNewPosts,
    error,
    book,
    moreTrades
}) => {
    const [attachment, setAttachment] = useState("");

    const [input, setInput] = useState({
        title:"",
        text: "",
        rating:"",
        content:"",
        development:"",
        pacing:"",
        writing:"",
        insights:"",
        dateRead:""
    })

    const [openModal, setOpenModal] = useState(false);
    const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

    // Modal
    useEffect(() => {
        setOneState("openModal", openModal);
    }, [openModal]);

    // get posts
    useEffect(() => {
        if (token) {
            getAllPosts();
        }
    }, [book]);

    const createNewTrade = async (formData) => {
        setLoadingCreateNewPost(true);
        if (!input.text) {
            toast.error("You must type something...");
            return;
        }
        try {
            let image = null;
            if (formData) {
                const {data} = await autoFetch.post(
                    `/api/post/upload-image`,
                    formData
                );
                image = {url: data.url, public_id: data.public_id};
            }

            const {data} = await autoFetch.post(`api/trade/create`, {
                text: input.text,
                condition: input.condition,
                address: input.address,
                location: input.location,
                book,
                image
            });
            setPosts([data.post, ...posts]);
            toast.success(data?.msg || "Create new trade post successfully!");

        } catch (error) {
            console.log(error);

            toast.error(error.response.data.msg || "Something went wrong");

        } finally{
            setLoadingCreateNewPost(false);

        }
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
                <div
                    className={`bg-white shadow-post
                    dark:bg-[#242526] rounded-lg w-full text-center text-xl font-bold py-10 `}>
                    <div>No post found... Try again!</div>
                </div>
            );
        }
        if (posts.length === 0) {
            return (
                <div className='w-full text-center text-xl font-semibold pt-[5vh] pb-[5vh] flex-col '>
                    <div>
                        Nothing to display
                    </div>
                </div>
            );
        }
        return (
            // <InfiniteScroll
            // className="!overflow-visible"
            //     dataLength={posts.length}
            //     next={getNewPosts}
            //     hasMore={true}
            //     loader={<LoadingPost />}>
            <div>
 {posts.map((post) => (
                    <Post
                        key={post._id}
                        currentPost={post}
                        user_img={user.image.url}
                        userId={user._id}
                        className={"shadow-post"}
                        userRole={user.role}
                        book={book}
                    />
                ))}
                {moreTrades && (<div className="text-sm cursor-pointer text-smallText block w-[100px] text-center mx-auto " onClick={getNewPosts}>LOAD MORE</div>)}

            </div>
               
            // </InfiniteScroll>
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
                setOpenModal={setOpenModal}
                text={input.text}
                user={user}
            />
        );
    };

    return (
        <div className=''>
            {form()}

            {openModal && (
                <TradeForm
                    setOpenModal={setOpenModal}
                    input = {input}
                    setInput = {setInput}
                    attachment={attachment}
                    setAttachment={setAttachment}
                    createNewPost={createNewTrade}
                />
            )}
            {loadingCreateNewPost && <LoadingPost className='mb-4' />}
            {content()}
        </div>
    );
};

export default Trade;
