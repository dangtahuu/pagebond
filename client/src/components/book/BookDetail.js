import React from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Review from "./components/Review";
import MyPost from "./components/MyPost";
import Trade from "./components/Trade";
import { FiEdit2 } from "react-icons/fi";
import ModalShelves from "../common/ModalShelves";
import { Rating, Tooltip } from "@mui/material";
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
const [moreReviews,setMoreReviews] = useState(true)
const [moreTrades,setMoreTrades] = useState(true)

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
    postsCount: "",
    ratingAvg: "",
    contentAvg:"",
    developmentAvg:"",
    pacingAvg:"",
    writingAvg:"",
    insightsAvg:"",
  });

  const [myPosts, setMyPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [exchange, setExchange] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedShelves, setSelectedShelves] = useState([]);
  const [topShelves, setTopShelves] = useState([]);

  const [reviewPage, setReviewPage] = useState(1);
  const [exchangePage, setExchangePage] = useState(1);
  const [error, setError] = useState("");
  const list = ["My Posts", "Reviews", "Trades"];
  const [menu, setMenu] = useState("Reviews");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBook();
    getTopShelves()
    getShelves();
    getSelectedShelves();
    setLoading(false);
  }, [id]);

  useEffect(() => {
   console.log(moreTrades)
  }, [moreTrades]);
  const getBook = async () => {
    const { data } = await autoFetch(`api/book/get-book/${id}`);
    const book = data.book;
    setBook({
      id,
      title: book.title,
      author: book.author || "Unknown author",
      publisher: book.publisher || "Unknown publisher",
      publishedDate: `Published ${book.publishedDate}` || "Unknown published date",
      description: book.description || "No description available",
      pageCount: `${book.pageCount} pages` || "No page number info",
      thumbnail:
        book.thumbnail ||
        "https://d827xgdhgqbnd.cloudfront.net/wp-content/uploads/2016/04/09121712/book-cover-placeholder.png",
      previewLink: book.previewLink || "",
      genres: book.genres || [],
      postsCount: data.postsCount || "",
      ratingAvg: data.ratingAvg || "",
      contentAvg:data.contentAvg ||"",
      developmentAvg: data.developmentAvg || "",
      pacingAvg: data.pacingAvg || "",
      writingAvg: data.writingAvg || "",
      insightsAvg: data.insightsAvg || "",
    });
  };

  useEffect(() => {
    setOneState("openModal", openModal);
  }, [openModal]);

  const getNewReviews = async () => {
    setReviewLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/review/book/${id}?page=${reviewPage + 1}`
      );
      setReviewPage(reviewPage + 1);
      setReviews((prev)=>[...prev, ...data.posts]);
      if (data.posts.length<10) setMoreReviews(false)
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
        `/api/review/book/${id}?page=1`
      );
      if (data.posts) setReviews(data.posts);
      if (data.posts.length<10) setMoreReviews(false)
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setReviewLoading(false);
    }
  };

  const getNewExchange = async () => {
    setExchangeLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/trade/book/${id}?page=${exchangePage + 1}&perPage=3`
      );
      setExchangePage(exchangePage + 1);
      setExchange([...exchange, ...data.posts]);
      if (data.posts.length<3) setMoreTrades(false)
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setExchangeLoading(false);
    }
  };

  const getFirstExchange = async () => {
    setExchangeLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/trade/book/${id}?page=1&perPage=3`
      );
      if (data.posts) setExchange(data.posts);
      if (data.posts.length<3) setMoreTrades(false)

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
      const [{ data: reviewRes }, {data: tradeRes} ] = await Promise.all([autoFetch.get(`/api/review/book-my/${id}`),autoFetch.get(`/api/trade/book-my/${id}`)]);
      let results = [...reviewRes.posts, ...tradeRes.posts]
      results.sort((a, b) => new Date(b.createdAt)  - new Date (a.createdAt));
      console.log(results)
      setMyPosts(results);
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

  const getTopShelves = async () => {
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-top-shelves-of-book/${id}`
      );
      setTopShelves(data.names);
    } catch (error) {
      console.log(error);
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

  const RatingDisplay = ({value, label}) => {
    return (
      <div className="inline-flex mb-1">
      <p className="mr-3 w-[100px]">{label}</p>
      <Rating name="half-rating-read" value={value} precision={0.5} readOnly />
      <p className="ml-3">{value}</p>
    </div>
    )
  }

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
          moreReviews={moreReviews}
        />
      );
    } else if (menu === "Trades") {
      return (
        <Trade
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
          moreTrades={moreTrades}
        />
      );
    }
  };
  return (
    <div
      className={`md:flex w-screen text-base min-h-screen bg-mainbg text-mainText pt-[65px] px-[3%] sm:px-[5%]`}
    >
      <div className="w-full mt-[3%] pt-3  md:grid grid-cols-10 items-start justify-center space-x-8 py-16 px-4">
        <div className="col-span-2 md:pr-8">
          <img
            className="max-w-[400px] md:w-[200px] object-contain mb-6 md:mb-0 rounded-lg"
            src={book.thumbnail}
            alt={`${book.title} cover`}
          />
         
         {topShelves && (
          <div className="mt-3">
            <div className="serif-display mb-2">Top Shelves</div>

            {
              topShelves.map((shelf)=> (
                <div className="text-xs inline-block rounded-full bg-dialogue px-2 py-1 my-1 mr-1">{shelf}</div>
              ))
            }
          </div>
        )}

<button
            className={`bg-[#00a11d] text-white text-sm block m-auto w-[200px] py-1.5 text-center rounded-full font-bold my-3`}
            // disabled={!text || loading}
            onClick={() => {
                        setOpenModal(true);
                    }}
            // onClick={handleButton}
          >
            Shelve this book
          </button>
          {/* <button
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
          )} */}
        </div>

        <div className="col-span-5">
            <h1 className="text-4xl font-bold serif-display text-white">{book.title}</h1>
          <h2 className="text-xl font-semibold">{book.author}</h2>

          <div className="flex items-center">
            {/* <StarIcon className="w-6 h-6 text-yellow-400 mr-1" /> */}
            {/* <span className="text-lg">{rating} ({reviews.length} reviews)</span> */}
          </div>

          <div className="text-base mt-3 text-justify" dangerouslySetInnerHTML={{ __html: book.description }} />
          {/* <p className="text-lg">{book.description}</p> */}
          <div className="text-sm  text-smallText mt-3">
          <div>{book.pageCount} pages</div>
          <div>{book.publishedDate} by {book.publisher}</div>
          </div>
         
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
        <div className="col-span-3 ">
          <div className="flex flex-col">
            <div className="serif-display mb-2">From {book.postsCount} reviews</div>
          <RatingDisplay value={book.ratingAvg} label="Rating"/>
         <RatingDisplay value={book.contentAvg} label="Content"/>
         <RatingDisplay value={book.developmentAvg} label="Development"/>
         <RatingDisplay value={book.pacingAvg} label="Pacing"/>
         <RatingDisplay value={book.writingAvg} label="Writing"/>
         <RatingDisplay value={book.insightsAvg} label="Insights"/>
          </div>
        
          {book.genres && (
          <div className="mt-3">
            <div className="serif-display mb-2">Genres</div>

            {
              book.genres.map((genre)=> (
                <div className="text-xs inline-block pb-1 border-b-2 border-b-dialogue my-1 mr-3">{genre}</div>
              ))
            }
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
