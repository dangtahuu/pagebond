import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import {
  Post,
  LoadingPost,
  LoadingForm,
  FormCreatePost,
  ReviewForm,
} from "../..";
import { IoFilterOutline } from "react-icons/io5";
import useOnClickOutside from "../../../hooks/useOnClickOutside";

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
  book,
  moreReviews,
  setPage,
}) => {
  const [attachment, setAttachment] = useState("");
  const [filterBox, setFilterBox] = useState(false);
  const [sort, setSort] = useState("popularity");
  const [filter, setFilter] = useState("All");
  const [input, setInput] = useState({
    title: "",
    text: "",
    image: "",
    rating: "",
    content: "",
    development: "",
    pacing: "",
    writing: "",
    insights: "",
    dateRead: "",
  });

  const filterRef = useRef();
  const exceptionRef = useRef();

  const sortList = { "Newest first": "createdAt", "Oldest first": "-createdAt", "Most popular": "popularity"};
  const filterList = ["All","0.5-1","1.5-2","2.5-3","3.5-4","4.5-5"]

  useOnClickOutside(filterRef, () => setFilterBox(false), exceptionRef);
  const [openModal, setOpenModal] = useState(false);
  const [loadingCreateNewPost, setLoadingCreateNewPost] = useState(false);

  // get posts
  useEffect(() => {
    if (token) {
      getAllPosts();
    }
  }, [book]);

  const handleFilter = (sort,filter) => {
    // console.log(filter)
    getAllPosts(sort, filter);
    setPage(1);
  };

  useEffect(()=>console.log(filter),[filter])

  const createNewReview = async (formData) => {
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

      const { data } = await autoFetch.post(`api/review/create`, {
        text: input.text,
        rating: input.rating,
        book,
        image,
        title: input.title,
        content: input.content,
        development: input.development,
        pacing: input.pacing,
        writing: input.writing,
        insights: input.insights,
        dateRead: input.dateRead,
      });
      setPosts([data.post, ...posts]);
      toast.success("Create new review successfully!");
    } catch (error) {
      console.log(error);

      toast.error(error.response.data.msg || "Something went wrong");
    } finally {
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

    if (posts.length === 0) {
      return (
        <div className="w-full text-center text-xl font-semibold pt-[5vh] pb-[5vh] flex-col ">
          <div>There's nothing here</div>
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

        {moreReviews && <div onClick={()=>{getNewPosts(sort,filter)}}>LOAD MORE</div>}
      </div>
    );
  };

  return (
    <div className="">
      <FormCreatePost
        setAttachment={setAttachment}
        setOpenForm={setOpenModal}
        user={user}
      />

      {openModal && (
        <ReviewForm
          setOpenModal={setOpenModal}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          createNewPost={createNewReview}
        />
      )}

      <div className="relative">
        <div ref={exceptionRef}>
          <IoFilterOutline
            onClick={() => {
              setFilterBox((prev) => !prev);
            }}
            className="text-xl cursor-pointer block ml-auto mb-2"
          />
        </div>

        {filterBox && (
          <div
            ref={filterRef}
            className="absolute p-3 rounded-lg right-0 top-[32px] w-[400px] bg-dialogue"
          >
            <div className="text-sm font-bold mb-2">Sort reviews</div>
            <div>
              {Object.keys(sortList).map((one) => (
                <div
                  onClick={() => {
                    setSort(sortList[one]);
                    handleFilter(sortList[one],filter);
                  }}
                  key={sortList[one]}
                  className={`cursor-pointer text-xs inline-block rounded-full ${
                    sort === sortList[one] ? "bg-greenBtn" : "bg-mainbg"
                  } px-2 py-1 my-1 mr-1`}
                >
                  {one}
                </div>
              ))}
            </div>

            <div className="text-sm font-bold my-2">Filter by rating</div>
            <div>
              {filterList.map((one) => (
                <div
                  onClick={() => {
                    setFilter(one);
                    handleFilter(sort,one);
                  }}
                  key={one}
                  className={`cursor-pointer text-xs inline-block rounded-full ${
                    filter === one? "bg-greenBtn" : "bg-mainbg"
                  } px-2 py-1 my-1 mr-1`}
                >
                  {one}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {loadingCreateNewPost && <LoadingPost className="mb-4" />}
      {content()}
    </div>
  );
};

export default Review;
