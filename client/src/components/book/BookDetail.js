import React from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Review from "./components/Review";
import ByMe from "./components/ByMe";
import Trade from "./components/Trade";
import { FiEdit2 } from "react-icons/fi";
import ModalShelves from "../common/ModalShelves";
import { Rating, Tooltip } from "@mui/material";
import Similar from "./components/Similar";
import Official from "./components/Official";
import Question from "./components/Question";
import { VscOpenPreview } from "react-icons/vsc";

function BookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { autoFetch, user, token, dark, setNameAndToken, setOneState } =
    useAppContext();
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [myPostLoading, setMyPostLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [officialLoading, setOfficialLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  const [shelvesLoading, setShelvesLoading] = useState(false);
  const [selectedShelvesLoading, setSelectedShelvesLoading] = useState(false);
  const [moreReviews, setMoreReviews] = useState(true);
  const [moreTrades, setMoreTrades] = useState(true);
  const [moreOfficial, setMoreOfficial] = useState(true);
  const [moreQuestion, setMoreQuestion] = useState(true);

  const [book, setBook] = useState({
    id: "",
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
    contentAvg: "",
    developmentAvg: "",
    pacingAvg: "",
    writingAvg: "",
    insightsAvg: "",
  });

  const [booksByAuthor, setBooksByAuthor] = useState([]);

  const [myPosts, setMyPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [exchange, setExchange] = useState([]);
  const [official, setOfficial] = useState([]);
  const [question, setQuestion] = useState([]);

  const [shelves, setShelves] = useState([]);
  const [selectedShelves, setSelectedShelves] = useState([]);
  const [topShelves, setTopShelves] = useState([]);

  const [reviewPage, setReviewPage] = useState(1);
  const [exchangePage, setExchangePage] = useState(1);
  const [officialPage, setOfficialPage] = useState(1);
  const [questionPage, setQuestionPage] = useState(1);

  const [error, setError] = useState("");
  const list = ["By me", "Reviews", "Tradings", "Official", "Questions"];
  const [menu, setMenu] = useState("Reviews");
  const [openModal, setOpenModal] = useState(false);
  const [shelfForm, setShelfForm] = useState(false);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [toRead, setToRead] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getBook();
        getBoooksByAuthor();
        getSimilarBooks(data.author);
        // getTopShelves();
        getShelves();
        getSelectedShelves();
      } catch (error) {
        // Handle errors if necessary
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getBook = async () => {
    const { data } = await autoFetch(`api/book/get-book/${id}`);
    const bookData = data.book;
    setBook({
      id,
      title: bookData.title,
      author: bookData.author || "Unknown author",
      publisher: bookData.publisher || "Unknown publisher",
      publishedDate:
        `Published ${bookData.publishedDate}` || "Unknown published date",
      description: bookData.description || "No description available",
      pageCount: `${bookData.pageCount} pages` || "No page number info",
      thumbnail:
        bookData.thumbnail ||
        "https://d827xgdhgqbnd.cloudfront.net/wp-content/uploads/2016/04/09121712/book-cover-placeholder.png",
      previewLink: bookData.previewLink || "",
      genres: bookData.genres || [],
      postsCount: bookData.numberOfRating || "",
      rating: bookData.rating || "",
      content: bookData.content || "",
      developement: bookData.development || "",
      pacing: bookData.pacing || "",
      writing: bookData.writing || "",
      insights: bookData.insights || "",
      topShelves: bookData.topShelves || [],
    });
    return bookData;
  };

  const getNewReviews = async (sort = "popularity", filter = "All") => {
    setReviewLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/review/book/${id}?page=${
          reviewPage + 1
        }&sort=${sort}&rating=${filter}`
      );
      setReviewPage(reviewPage + 1);
      setReviews((prev) => [...prev, ...data.posts]);
      if (data.posts.length < 10) setMoreReviews(false);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setReviewLoading(false);
    }
  };

  const getFirstReviews = async (sort = "popularity", filter = "All") => {
    setMoreReviews(true);
    setReviewLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/review/book/${id}?page=1&sort=${sort}&rating=${filter}`
      );
      if (data.posts) setReviews(data.posts);
      if (data.posts.length < 10) setMoreReviews(false);
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
        `/api/trade/book/${id}?page=${exchangePage + 1}`
      );
      setExchangePage(exchangePage + 1);
      setExchange([...exchange, ...data.posts]);
      if (data.posts.length < 10) setMoreTrades(false);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setExchangeLoading(false);
    }
  };

  const getFirstExchange = async () => {
    setMoreTrades(true);
    setExchangeLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/trade/book/${id}?page=1`);
      if (data.posts) setExchange(data.posts);
      if (data.posts.length < 10) setMoreTrades(false);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setExchangeLoading(false);
    }
  };

  const getNewOfficial = async () => {
    setOfficialLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/special/book/${id}?page=${officialPage + 1}`
      );
      setExchangePage(officialPage + 1);
      setExchange([...official, ...data.posts]);
      if (data.posts.length < 10) setMoreOfficial(false);
    } catch (error) {
      console.log(error);
      setError(true);
    }
    setOfficialLoading(false);
  };

  const getFirstOfficial = async () => {
    setMoreOfficial(true);
    setOfficialLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/special/book/${id}?page=1`);
      if (data.posts) setOfficial(data.posts);
      if (data.posts.length < 10) setMoreOfficial(false);
    } catch (error) {
      console.log(error);
    }
    setOfficialLoading(false);
  };

  const getNewQuestion = async () => {
    setQuestionLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/question/book/${id}?page=${questionPage + 1}`
      );
      setQuestionPage(questionPage + 1);
      setExchange([...official, ...data.posts]);
      if (data.posts.length < 10) setMoreQuestion(false);
    } catch (error) {
      console.log(error);
      setError(true);
    }
    setQuestionLoading(false);
  };

  const getFirstQuestion = async () => {
    setMoreQuestion(true);

    setQuestionLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/question/book/${id}?page=1`);
      if (data.posts) setQuestion(data.posts);
      if (data.posts.length < 10) setMoreQuestion(false);
    } catch (error) {
      console.log(error);
    }
    setQuestionLoading(false);
  };

  const getMyPosts = async () => {
    setMyPostLoading(true);
    try {
      const [{ data: reviewRes }, { data: tradeRes }, { data: specialRes }] =
        await Promise.all([
          autoFetch.get(`/api/review/book-my/${id}`),
          autoFetch.get(`/api/trade/book-my/${id}`),
          autoFetch.get(`/api/special/book-my/${id}`),
        ]);
      let results = [
        ...reviewRes.posts,
        ...tradeRes.posts,
        ...specialRes.posts,
      ];
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // console.log(results);
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

  // const getTopShelves = async () => {
  //   try {
  //     const { data } = await autoFetch.get(
  //       `/api/shelf/get-top-shelves-of-book/${id}`
  //     );
  //     setTopShelves(data.names);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getSelectedShelves = async () => {
    setSelectedShelvesLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-selected-shelves/${id}`
      );
      setSelectedShelves(data.ids);
      // console.log()
      if(data.names.includes("to read")) setToRead(true) 
      else setToRead(false)
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setSelectedShelvesLoading(false);
    }
  };

  const submitShelves = async (shelves) => {
    console.log("ssssssssssssss");
    // setSelectedShelvesLoading(true);
    console.log(shelves);
    try {
      const { data } = await autoFetch.post(
        `/api/shelf/book-to-shelf`,
        shelves
      );
      setSelectedShelves(data.selected);
    } catch (error) {
      console.log(error);
      setError(true);
      // } finally {
      //   setSelectedShelvesLoading(false);
    }
  };

  const handleToRead = async () => {
    try {
      if (toRead) {
        const { data } = await autoFetch.patch(`/api/shelf/remove-tbr`, { id });
      } else {
        const { data } = await autoFetch.patch(`/api/shelf/add-tbr`, { id });
      }
      await getSelectedShelves();
    } catch (error) {
      console.log(error);
    }
  };

  const getSimilarBooks = async (author) => {
    try {
      const { data } = await autoFetch.get(`/api/book/get-similar-books/${id}`);
      // console.log(books)
      let similarBooks = [];
      data.books.forEach((one) => {
        // console.log(one.author)
        // console.log(book.author)
        //   console.log(one.author===book.author)
        if (one.author !== author) similarBooks.push(one);
      });

      // const books = data.books
      // books.shift()
      // // console.log(books)
      setSimilarBooks(similarBooks);
    } catch (error) {
      console.log(error);
    }
  };

  const getBoooksByAuthor = async () => {
    try {
      const { data } = await autoFetch.get(`/api/book/get-book-author/${id}`);
      // console.log(books)
      const result = data.books;
      const booksByAuthor = result.filter((one) => {
        return one._id !== id;
      });
      // console.log(books)
      setBooksByAuthor(booksByAuthor);
    } catch (error) {
      console.log(error);
    }
  };

  const RatingDisplay = ({ value, label }) => {
    return (
      <div className="inline-flex mb-1">
        <p className="mr-3 w-[100px]">{label}</p>
        <Rating
          name="half-rating-read"
          value={value}
          precision={0.1}
          readOnly
        />
        <p className="ml-3">{value}</p>
      </div>
    );
  };

  const main = () => {
    if (menu === "By me") {
      return (
        <ByMe
          posts={myPosts}
          loading={myPostLoading}
          token={token}
          user={user}
          getAllPosts={getMyPosts}
          error={error}
          book={book}
          setPosts={setMyPosts}
          autoFetch={autoFetch}
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
          moreReviews={moreReviews}
          setPage={setReviewPage}
        />
      );
    } else if (menu === "Tradings") {
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
    } else if (menu === "Official") {
      return (
        <Official
          posts={official}
          loading={officialLoading}
          token={token}
          autoFetch={autoFetch}
          user={user}
          getAllPosts={getFirstOfficial}
          setPosts={setOfficial}
          getNewPosts={getNewOfficial}
          book={book}
          moreTrades={moreOfficial}
        />
      );
    } else if (menu === "Questions") {
      return (
        <Question
          posts={question}
          loading={questionLoading}
          token={token}
          autoFetch={autoFetch}
          user={user}
          getAllPosts={getFirstQuestion}
          setPosts={setQuestion}
          getNewPosts={getNewQuestion}
          book={book}
          moreTrades={moreQuestion}
        />
      );
    }
  };
  return (
    <div
      className={`w-screen text-base min-h-screen bg-mainbg text-mainText pt-[65px] px-[3%] sm:px-[5%]`}
    >
      <div className="w-full mt-[3%] pt-3  md:grid grid-cols-10 items-start justify-center gap-x-8 py-16 px-4">
        <div className="col-span-2 md:pr-8">
          <img
            className="max-w-[400px] md:w-[200px] object-contain mb-6 md:mb-0 rounded-lg"
            src={book.thumbnail}
            alt={`${book.title} cover`}
          />

          {book.topShelves?.length > 0 && (
            <div className="mt-3">
              <div className="serif-display mb-2">Top Shelves</div>

              {book.topShelves.map((shelf) => (
                <div
                  className="cursor-pointer text-xs inline-block rounded-full bg-dialogue px-2 py-1 my-1 mr-1"
                  onClick={() => {
                    navigate(
                      `/browse/?genre=${encodeURIComponent(
                        JSON.stringify(shelf)
                      )}`
                    );
                  }}
                >
                  {shelf}
                </div>
              ))}
            </div>
          )}

          <button
            className={`bg-[#00a11d] text-white text-sm block m-auto w-[200px] py-1.5 text-center rounded-full font-bold my-3`}
            // disabled={!text || loading}
            onClick={() => {
              console.log(shelfForm);
              setShelfForm(true);
            }}
            // onClick={handleButton}
          >
            Shelve this book
          </button>

          {shelfForm && (
            <ModalShelves
              shelves={shelves}
              setShelves={setShelves}
              selected={selectedShelves}
              submitShelves={submitShelves}
              setOpenModal={setShelfForm}
              book={book}
            ></ModalShelves>
          )}

<button
          className={`bg-[#00a11d] text-white text-sm block m-auto w-[200px] py-1.5 text-center rounded-full font-bold my-3`}
          // disabled={!text || loading}
          onClick={handleToRead}
          // onClick={handleButton}
        >
          {toRead
            ? "Remove from To read"
            : "Want to read"}
        </button>
        </div>

      

        <div className="col-span-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold serif-display text-white">
                {book.title}
              </h1>
              <h2 className="text-xl font-semibold">{book.author}</h2>
            </div>
            <a
              href={`${book.previewLink}&lpg=PP1&pg=PP1&output=embed`}
              target="_blank"
              rel="noreferrer"
            >
              <VscOpenPreview className="text-2xl" />
            </a>
          </div>

          <div
            className="text-base mt-3 text-justify"
            dangerouslySetInnerHTML={{ __html: book.description }}
          />
          {/* <p className="text-lg">{book.description}</p> */}
          <div className="text-sm  text-smallText mt-3">
            <div>{book.pageCount}</div>
            <div>
              {book.publishedDate} by {book.publisher}
            </div>
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
            <div className="serif-display mb-2">
              From {book.postsCount} reviews
            </div>
            <RatingDisplay value={book.rating} label="Rating" />
            <RatingDisplay value={book.content} label="Content" />
            <RatingDisplay value={book.developement} label="Development" />
            {/* <RatingDisplay value={book.pacingAvg} label="Pacing" /> */}
            <RatingDisplay value={book.writing} label="Writing" />
            <RatingDisplay value={book.insights} label="Insights" />
          </div>

          {book.genres && (
            <div className="mt-3">
              <div className="serif-display mb-2">Genres</div>

              {book.genres.map((genre) => (
                <div
                  className="cursor-pointer text-xs inline-block pb-1 border-b-2 border-b-dialogue my-1 mr-3"
                  onClick={() => {
                    navigate(
                      `/browse/?genre=${encodeURIComponent(
                        JSON.stringify(genre)
                      )}`
                    );
                  }}
                >
                  {genre}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full mt-[3%] pt-3  ">
        {booksByAuthor ? (
          <Similar name="From the author" books={booksByAuthor} />
        ) : (
          <></>
        )}
      </div>

      <div className="w-full mt-[3%] pt-3  ">
        {similarBooks ? (
          <Similar name="Similar Books" books={similarBooks} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
