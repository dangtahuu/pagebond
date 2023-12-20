import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {Post, CreateBox, TradeForm} from "../..";
import ReactLoading from "react-loading";

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
        location:"",
        address:"",
        image:"",
        hashtag:[]
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
                hashtag: input.hashtag,
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

    const Content = () => {
        if (loading) {
            return (
                <div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>
            );
        }
      
        if (posts.length === 0) {
            return (
                <div className='w-full text-center text-xl font-semibold pt-[5vh] pb-[5vh] flex-col '>
                    <div>
                        There's nothing here at the momment
                    </div>
                </div>
            );
        }
        return (
            <div>
 {posts.map((post) => (
                    <Post
                        key={post._id}
                        currentPost={post}
                        className={"shadow-post"}
                        book={book}
                    />
                ))}
                {moreTrades && (<div className="text-sm cursor-pointer text-smallText block w-[100px] text-center mx-auto " onClick={getNewPosts}>LOAD MORE</div>)}

            </div>
               
        );
    };


    return (
        <div className=''>
            <CreateBox
                setAttachment={setAttachment}
                setOpenForm={setOpenModal}
                user={user}
            />

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
            {loadingCreateNewPost && (
        <div className="flex justify-center main-bg">
          <ReactLoading type="bubbles" width={64} height={64} color="white" />
        </div>
      )}
            <Content/>
        </div>
    );
};

export default Trade;
