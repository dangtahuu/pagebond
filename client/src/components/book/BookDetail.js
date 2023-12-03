import React from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Review from "./components/Review";
import MyPost from "./components/MyPost";
import { FiEdit2 } from "react-icons/fi";
import ModalShelves from "../common/ModalShelves";
import { Tooltip } from "@mui/material";
function BookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { autoFetch, user, token, dark, setNameAndToken, setOneState } =
    useAppContext();
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [myPostLoading, setMyPostLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [shelvesLoading, setShelvesLoading] = useState(false);
  const [selectedShelvesLoading, setSelectedShelvesLoading] = useState(false);

  const [book, setBook] = useState({
    id:"",
    title: "",
    author: "",
    publisher: "",
    publishedDate: "",
    description: "",
    pageCount: "",
    thumbnail: "",
    previewLink: "",
    genres: [],
  });

  const [myPosts, setMyPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [exchange, setExchange] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedShelves, setSelectedShelves] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [exchangePage, setExchangePage] = useState(1);
  const [error, setError] = useState("");
  const list = ["My Posts", "Reviews", "Exchange"];
  const [menu, setMenu] = useState("Reviews");
  const [rating, setRating] = useState(0);
  const [numberOfRating, setNumberofRating] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBook();
    setLoading(false);
    getShelves();
    getSelectedShelves();
  }, [id]);

  // const getBook = async () => {
  //   const res = await fetch(
  //     `https://www.googleapis.com/books/v1/volumes/${id}`
  //   );
  //   const bookInfo = await res.json();
  //   setBook({
  //     title: bookInfo.volumeInfo.title,
  //     author: bookInfo.volumeInfo.authors[0] || "Unknown author",
  //     publisher: bookInfo.volumeInfo.publisher || "Unknown publisher",
  //     publishedDate:
  //       bookInfo.volumeInfo.publishedDate || "Unknown published date",
  //     description:
  //       bookInfo.volumeInfo.description || "No description available",
  //     pageCount: bookInfo.volumeInfo.pageCount || "N/a",
  //     thumbnail:
  //       bookInfo.volumeInfo.imageLinks.thumbnail ||
  //       "https://d827xgdhgqbnd.cloudfront.net/wp-content/uploads/2016/04/09121712/book-cover-placeholder.png",
  //     preview: bookInfo.previewLink || "",
  //   });
  // };

  const getBook = async () => {
    const { data } = await autoFetch(`api/book/get-book/${id}`);
    console.log(data);
    const book = data.book;
    // console.log(book)
    setBook({
      id,
      title: book.title,
      author: book.author || "Unknown author",
      publisher: book.publisher || "Unknown publisher",
      publishedDate: book.publishedDate || "Unknown published date",
      description: book.description || "No description available",
      pageCount: book.pageCount || "No page number info",
      thumbnail:
        book.thumbnail ||
        "https://d827xgdhgqbnd.cloudfront.net/wp-content/uploads/2016/04/09121712/book-cover-placeholder.png",
      previewLink: book.previewLink || "",
      genres: book.genres || [],
    });
  };

  useEffect(() => {
    setOneState("openModal", openModal);
  }, [openModal]);

  const getNewReviews = async () => {
    setReviewLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/review/book-reviews/${id}?page=${reviewPage + 1}`
      );
      setReviewPage(reviewPage + 1);
      setReviews((prev)=>[...prev, ...data.posts]);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setReviewLoading(false);
    }
  };

  const getFirstReviews = async () => {
    setReviewLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/review/book-reviews/${id}?page=1`
      );
      if (data.posts) setReviews(data.posts);
      setRating(data.ratingAvg);
      setNumberofRating(data.postsCount);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setReviewLoading(false);
    }
  };

  const getFirstExchange = async () => {
    setExchangeLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/post/book-exchanges/${id}?page=${exchangePage + 1}&perPage=5`
      );
      setExchangePage(exchangePage + 1);
      setExchange([...exchange, ...data.posts]);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setExchangeLoading(false);
    }
  };

  const getNewExchange = async () => {
    setExchangeLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/post/book-exchanges/${id}?page=1&perPage=5`
      );
      if (data.posts) setExchange(data.posts);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setExchangeLoading(false);
    }
  };

  const getMyPosts = async () => {
    setMyPostLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/post/book-myposts/${id}`);
      setMyPosts(data.posts);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setMyPostLoading(false);
    }
  };

  const getShelves = async () => {
    setShelvesLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-shelves/${user._id}`
      );
      setShelves(data.shelves);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setShelvesLoading(false);
    }
  };

  const getSelectedShelves = async () => {
    setSelectedShelvesLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-selected-shelves/${id}`
      );
      setSelectedShelves(data.shelves);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setSelectedShelvesLoading(false);
    }
  };

  const submitShelves = async (data) => {
    // setSelectedShelvesLoading(true);
    try {
      const { data } = await autoFetch.post(`/api/shelf/book-to-shelf`, data);
      setSelectedShelves(data.selected);
    } catch (error) {
      console.log(error);
      setError(true);
      // } finally {
      //   setSelectedShelvesLoading(false);
    }
  };

  const main = () => {
    if (menu === "My Posts") {
      return (
        <MyPost
          posts={myPosts}
          loading={myPostLoading}
          token={token}
          user={user}
          getAllPosts={getMyPosts}
          error={error}
          book={book}
        />
      );
    } else if (menu === "Reviews") {
      return (
        <Review
          posts={reviews}
          loading={reviewLoading}
          token={token}
          autoFetch={autoFetch}
          setOneState={setOneState}
          user={user}
          getAllPosts={getFirstReviews}
          setPosts={setReviews}
          getNewPosts={getNewReviews}
          error={error}
          book={book}
          title={book.title}
          author={book.author}
          thumbnail={book.thumbnail}
        />
      );
    } else if (menu === "Exchange") {
      return (
        <Review
          posts={exchange}
          loading={exchangeLoading}
          token={token}
          autoFetch={autoFetch}
          setOneState={setOneState}
          user={user}
          getAllPosts={getFirstExchange}
          setPosts={setExchange}
          getNewPosts={getNewExchange}
          error={error}
          book={book}
          title={book.title}
          author={book.author}
          thumbnail={book.thumbnail}
        />
      );
    }
  };
  return (
    <div
      className={`md:flex w-screen min-h-screen bg-white pt-[65px] px-[3%] sm:px-[5%]`}
    >
      <div className="w-full mt-[3%] pt-3 bg-white md:grid grid-cols-10 items-start justify-center space-x-8 py-16 px-4">
        <div className="col-span-2 md:pr-8">
          <img
            className="w-full object-contain mb-6 md:mb-0"
            src={book.thumbnail}
            alt={`${book.title} cover`}
          />
          {!reviewLoading && <div className="text-xl">{rating} ⭐</div>}
          <button
            className="flex gap-x-2  items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"
            onClick={() => {
              // navigate(`/update-profile`);
            }}
          >
            <FiEdit2 className=" " />
            Shelve
          </button>
          {openModal && (
            <ModalShelves
              shelves={shelves}
              selected={selectedShelves}
              submitShelves={submitShelves}
              setOpenModal={setOpenModal}
              book
            ></ModalShelves>
          )}
        </div>

        <div className="col-span-5">
          <Tooltip title="Delete">
            <h1 className="text-3xl font-bold">{book.title}</h1>
          </Tooltip>
          <h2 className="text-xl font-semibold">{book.author}</h2>

          <div className="flex items-center">
            {/* <StarIcon className="w-6 h-6 text-yellow-400 mr-1" /> */}
            {/* <span className="text-lg">{rating} ({reviews.length} reviews)</span> */}
          </div>

          <div dangerouslySetInnerHTML={{ __html: book.description }} />
          {/* <p className="text-lg">{book.description}</p> */}

          <div className="flex mx-0 sm:mx-10 ">
            <ul className="flex items-center justify-between w-full px-16 py-1 gap-x-10 ">
              {list.map((v) => (
                <li
                  key={v + "button"}
                  className={`li-profile ${menu === v && "active"} `}
                  onClick={() => {
                    setMenu(v);
                    // navigate(`/profile/${user._id}`);
                  }}
                >
                  {v}
                </li>
              ))}
            </ul>
          </div>

          {main()}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
