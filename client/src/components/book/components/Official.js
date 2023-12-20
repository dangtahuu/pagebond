import React, {useEffect, useState} from "react";
import ReactLoading from "react-loading";
import {toast} from "react-toastify";
import {Post, CreateBox} from "../..";
import SpecialPostForm from "../../common/SpecialPostForm";

const Official = ({
    posts,
    loading,
    token,
    autoFetch,
    user,
    getAllPosts,
    setPosts,
    getNewPosts,
    book,
    moreOfficial
}) => {
    const [attachment, setAttachment] = useState("");

    const [input, setInput] = useState({
      title: "",
      text: "",
      image: "",
      hashtag: []
    });
  
    const [openModal, setOpenModal] = useState(false);
    const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

    // get posts
    useEffect(() => {
        if (token) {
            getAllPosts();
        }
    }, [book]);

    const createNewSpecialPost = async (formData) => {
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
          const { data } = await autoFetch.post(`api/special/create`, {
            text: input.text,
            title: input.title,
            book,
            image,
        hashtag: input.hashtag,
            type: user.role === 1 ? 1 : 0,
          });
          setPosts((prev) => [data.post, ...prev]);
    
          if (user.role === 1)
            toast.success("Create new special post successfully!");
          else
            toast.success(
              "An admin will verify your special post before it gets promoted"
            );
        } catch (error) {
          console.log(error);
          toast.error(error.response.data.msg || "Something went wrong");
        }
        setLoadingCreateNewPost(false);
      };

    const Content = () => {
        if (loading) {
            return (
                <div>
                   <div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>
                </div>
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

                {moreOfficial && (<div onClick={getNewPosts}>LOAD MORE</div>)}
            </div>
               
        );
    };


    return (
        <div className=''>
           {user.role!==3 &&  <CreateBox
        setOpenForm={setOpenModal}
        user={user}
        text="special post"
      />}
        

      {openModal && (
        <SpecialPostForm
        setOpenModal={setOpenModal}
        input={input}
        setInput={setInput}
        attachment={attachment}
        setAttachment={setAttachment}
        createNewPost={createNewSpecialPost}
      />
      )}
            {loadingCreateNewPost && (
        <div className="flex justify-center main-bg">
          <ReactLoading type="bubbles" width={64} height={64} color="white" />
        </div>
      )}
            <Content />
            
        </div>
    );
};

export default Official;
