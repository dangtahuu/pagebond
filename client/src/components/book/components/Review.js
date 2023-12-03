import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {Modal, Post, LoadingPost, LoadingForm, FormCreatePost, ReviewForm} from "../..";
import InfiniteScroll from "react-infinite-scroll-component";

const Review = ({
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
    book
}) => {
    const [attachment, setAttachment] = useState("");
    // const [text, setText] = useState("");
    // const [rating, setRating] = useState("");
    // const [content, setContent] = useState("")
    // const [development, setDevelopment] = useState("")
    // const [pacing, setPacing] = useState("")
    // const [writing, setWriting] = useState("")
    // const [insights, setInsights] = useState("")

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

    const createNewReview = async (formData) => {
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

            const {data} = await autoFetch.post(`api/review/create-review`, {
                text: input.text,
                rating: input.rating,
                book,
                image,
                title: input.title,
                content:input.content,
                development:input.development,
                pacing:input.pacing,
                writing:input.writing,
                insights:input.insights,
                dateRead: input.dateRead
            });
            setPosts([data.post, ...posts]);
            toast.success(data?.msg || "Create new review successfully!");

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
                <ReviewForm
                    setOpenModal={setOpenModal}
                    input = {input}
                    setInput = {setInput}
                    attachment={attachment}
                    setAttachment={setAttachment}
                    createNewPost={createNewReview}
                />
            )}
            {loadingCreateNewPost && <LoadingPost className='mb-4' />}
            {content()}
        </div>
    );
};

export default Review;
