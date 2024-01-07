import { LuBadgeCheck } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import HeaderMenu from "../common/HeaderMenu";
import ReviewForm from "../common/ReviewForm";
import { useAppContext } from "../../context/useContext";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import ReactLoading from "react-loading";
import Post from "../common/Post";
import CreateBox from "../common/CreateBox";
import { IoFilterOutline } from "react-icons/io5";
import FilterBox from "./components/FilterBox";

const MainBook = ({ id, book, setStatus }) => {
  const { autoFetch, user, setOneState } = useAppContext();

  const list = {
    "By me": "me",
    Reviews: "review",
    Tradings: "trade",
    News: "news",
    Questions: "question",
  };
  const [menu, setMenu] = useState("Reviews");

  const [openModal, setOpenModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPostLoading, setNewPostLoading] = useState(false);
  const [morePosts, setMorePosts] = useState(false);
  const [page, setPage] = useState(0);

  const [filterBox, setFilterBox] = useState(false);

  const [sort, setSort] = useState("popularity");
  const [filter, setFilter] = useState("All");

  const filterRef = useRef();
  const exceptionRef = useRef();
  useOnClickOutside(filterRef, () => setFilterBox(false), exceptionRef);

  const sortListReview = {
    "Most popular": "popularity",
    "Newest first": "createdAt",
    "Oldest first": "-createdAt",
  };
  const filterListReview = [
    "All",
    "0.5",
    "1",
    "1.5",
    "2",
    "2.5",
    "3",
    "3.5",
    "4",
    "4.5",
    "5",
  ];

  const sortListQuestion = {
    "Most popular": "popularity",
    "Start to Finish": "start",
    "Finish to Start": "finish",
    "Newest first": "createdAt",
    "Oldest first": "-createdAt",
  };

  // get posts
  useEffect(() => {
    getPosts();
  }, [id, menu]);

  useEffect(() => {
    setOneState("openModal", openModal);
  }, [openModal]);

  const getPosts = async (sort, filter) => {
    setLoading(true);
    try {
      if (list[menu] !== "me") {
        const { data } = await autoFetch.get(
          `/api/${list[menu]}/book/${id}?page=1&sort=${
            sort ? sort : ""
          }&filter=${filter ? filter : ""}`
        );
        setPage(2);
        setPosts(data.posts);

        if (data.posts.length < 10) setMorePosts(false);
      } else {
        const { data } = await autoFetch.get(
          `/api/post/withUserAndBook/${user._id}/${id}`
        );
        setPosts(data.posts);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getMorePosts = async (sort, filter) => {
    try {
      if (list[menu] !== "me") {
        const { data } = await autoFetch.get(
          `/api/${list[menu]}/book/${id}?page=${page}&sort=${
            sort ? sort : ""
          }&filter=${filter ? filter : ""}`
        );
        setPage(page + 1);
        setPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 10) setMorePosts(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const Content = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="w-full text-center text-xl font-semibold pt-[5vh] pb-[5vh] flex-col ">
          <div>There's nothing here at the momment</div>
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

        {morePosts && (
          <div
            onClick={() => {
              getMorePosts(sort, filter);
            }}
          >
            LOAD MORE
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex items-center gap-x-2 mb-2">
        <LuBadgeCheck className="text-2xl text-greenBtn" />
        <div className="serif-display text-2xl">From the community</div>
      </div>
      <HeaderMenu list={Object.keys(list)} menu={menu} handler={setMenu} />

      {list[menu] !== "me" && (
        <>
          <CreateBox setOpenForm={setOpenModal} user={user} />

          {openModal && (
            <ReviewForm
              setOpenModal={setOpenModal}
              setPostLoading={setNewPostLoading}
              posts={posts}
              setPosts={setPosts}
              type={list[menu]}
              book={book}
              setStatus={setStatus}
            />
          )}

          {(list[menu] === "review" || list[menu] === "question") && (
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
                <FilterBox
                  setFilterBox={setFilterBox}
                  getPosts={getPosts}
                  filterRef={filterRef}
                  setFilter={setFilter}
                  filter={filter}
                  setSort={setSort}
                  sort={sort}
                  filterList={list[menu] === "review" && filterListReview}
                  sortList={
                    list[menu] === "review" ? sortListReview : sortListQuestion
                  }
                />
              )}
            </div>
          )}

          {newPostLoading && (
            <div className="flex justify-center main-bg">
              <ReactLoading
                type="bubbles"
                width={64}
                height={64}
                color="white"
              />
            </div>
          )}
        </>
      )}

      <Content />
    </div>
  );
};

export default MainBook;
