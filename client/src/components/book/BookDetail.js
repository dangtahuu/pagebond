import React, { useRef } from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Review from "./components/Review";
import ByMe from "./components/ByMe";
import Trade from "./components/Trade";
import { FiEdit2 } from "react-icons/fi";
import ShelvesForm from "../common/ShelvesForm";
import { Rating, Tooltip } from "@mui/material";
import Similar from "./components/Similar";
import Official from "./components/Official";
import Question from "./components/Question";
import { VscOpenPreview } from "react-icons/vsc";
import Post from "../common/Post";
import ReactLoading from "react-loading";
import { LuBadgeCheck } from "react-icons/lu";
import HeaderMenu from "../common/HeaderMenu";
import { AiOutlineMessage } from "react-icons/ai";
import { toast } from "react-toastify";
import BarsDataset from "./components/Chart";
import { TbEyeglass } from "react-icons/tb";
import { BsBookmarkPlus } from "react-icons/bs";
import useOnClickOutside from "../../hooks/useOnClickOutside";

function BookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { autoFetch, user, token, dark, setNameAndToken, setOneState } =
    useAppContext();
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);

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
  const [promptOpen, setPromptOpen] = useState(false);
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
    rating: "",
    content: "",
    development: "",
    pacing: "",
    writing: "",
    insights: "",
    topShelves: [],
    numberOfRating: 0,
  });

  const [booksByAuthor, setBooksByAuthor] = useState([]);

  const [myPosts, setMyPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [exchange, setExchange] = useState([]);
  const [official, setOfficial] = useState([]);
  const [question, setQuestion] = useState([]);
  const [featured, setFeatured] = useState({});

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
  const [promptList, setPromptList] = useState([]);
  const [chart, setChart] = useState([]);


  const [toRead, setToRead] = useState(false);

  const promptRef = useRef();
  const exceptRef = useRef();


  useOnClickOutside(promptRef, () => {
    setPromptOpen(false);
  }, exceptRef);

  let chatInfo = {
    name: "Book Assistant",
    _id: "6561e80e6dfae0a11ba298b6",
    image: {
      url: "http://res.cloudinary.com/dksyipjlk/image/upload/v1678289715/o4e7jk4wizov3cjcfdos.jpg",
    },
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getBook();
        getFeatured();
        getBoooksByAuthor();
        getSimilarBooks(data.author);
        getChart()
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

  useEffect(() => {
    getPromptsForBook();
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
      numberOfRating: bookData.numberOfRating || 0,
    });
    return bookData;
  };

  const getPromptsForBook = async () => {
    setPromptLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/book/get-book-prompts/${id}`);
      setPromptList(data.prompts);
    } catch (error) {
      console.log(error);
    }
    setPromptLoading(false);
  };

  const getChart = async () => {
    // setPromptLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/review/book-chart/${id}`);
      console.log(data.result)
      setChart(data.result);
    } catch (error) {
      console.log(error);
    }
    // setPromptLoading(false);
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

  const getFeatured = async () => {
    try {
      const { data } = await autoFetch.get(`/api/special/book-featured/${id}`);
      setFeatured(data.post);
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };

  const getSelectedShelves = async () => {
    setSelectedShelvesLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-selected-shelves/${id}`
      );
      setSelectedShelves(data.ids);
      if (data.names.includes("to read")) setToRead(true);
      else setToRead(false);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setSelectedShelvesLoading(false);
    }
  };

  const submitShelves = async (shelves) => {
    console.log(shelves);
    try {
      const { data } = await autoFetch.patch(
        `/api/shelf/book-to-shelf`,
        shelves
      );
      setSelectedShelves(data.selected);
      toast.success("Modify shelves successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
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
      <div className="inline-flex">
        <p className="mr-3 w-[100px]">{label}</p>
        <Rating
          className="!text-md flex-1"
          value={value}
          precision={0.1}
          readOnly
        />
        <p className="ml-3">{value}</p>
      </div>
    );
  };

  const Featured = () => {
    return (
      <div className="my-4 border-b-[1px] border-b-dialogue">
        <div className="flex items-center gap-x-2 mb-2">
          <LuBadgeCheck className="text-2xl text-greenBtn" />
          <div className="serif-display text-2xl">Featured</div>
        </div>
        <Post currentPost={featured} book={book} />
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
          morePosts={moreQuestion}
          promptList={promptList}
          promptLoading={promptLoading}
        />
      );
    }
  };

  if (loading)
    return (
      <div className="w-screen flex min-h-screen bg-mainbg justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );
  return (
    <div
      className={`w-screen text-base min-h-screen bg-mainbg text-mainText pt-[65px] px-[3%] sm:px-[5%]`}
    >
      {shelfForm && (
        <ShelvesForm
          shelves={shelves}
          setShelves={setShelves}
          selected={selectedShelves}
          submitShelves={submitShelves}
          setOpenModal={setShelfForm}
          book={book}
        ></ShelvesForm>
      )}
      <div className="w-full mt-[3%] pt-3  md:grid grid-cols-10 items-start justify-center gap-x-8 py-16 px-4">
        <div className="col-span-2 md:pr-8 sticky top-[65px]">
          <img
            className="max-w-[400px] md:w-[200px] object-contain mb-6 md:mb-0 rounded-lg"
            src={book.thumbnail}
            alt={`${book.title} cover`}
          />

          <div className="flex flex-col mt-4 gap-y-2">
            <a
              href={`${book.previewLink}&lpg=PP1&pg=PP1&output=embed`}
              target="_blank"
              rel="noreferrer"
            >
              <button
                className={`primary-btn w-[200px]`}
              >
                <VscOpenPreview className="text-lg text-white" /> Preview
              </button>
            </a>

            <button
              className={`primary-btn w-[200px]`}
              onClick={() => handleToRead}
            >
              <TbEyeglass className="text-lg text-white" />{toRead ? "Remove from To read" : "Want to read"}
            </button>

            <button
              className={`primary-btn  w-[200px]`}
              // disabled={!text || loading}
              onClick={() => {
                setShelfForm(true);
              }}
              // onClick={handleButton}
            >
             <BsBookmarkPlus className="text-lg text-white" /> Shelve this book
            </button>
          </div>
        </div>

        <div className="col-span-5">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold serif-display text-white">
                {book.title}
              </h1>
              <div className="relative" ref={exceptRef}>
                <AiOutlineMessage
                  className={`text-2xl ${
                    !promptLoading ? `cursor-pointer` : `opacity-30`
                  } `}
                  onClick={() => {
                    setPromptOpen((prev) => !prev);
                  }}
                />
                {promptOpen && (
                  <div
                  ref={promptRef}
                    className={`flex flex-col items-center py-4 bg-navBar justify-center rounded-lg absolute w-[450px] right-0 top-[40px] mb-5 gap-y-2
                  `}
                  >
                    {promptList.map((one) => (
                      <div
                        className="w-[400px] text-sm py-2 px-4 rounded-lg border-[1px] border-dialogue cursor-pointer"
                        onClick={() => {
                          chatInfo = { ...chatInfo, text: one };
                          navigate(
                            `/messenger/?data=${encodeURIComponent(
                              JSON.stringify(chatInfo)
                            )}`
                          );
                          // setPageState("text", one)
                        }}
                      >
                        <div>{one}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{book.author}</h2>

              <div>
                {promptLoading && (
                  <ReactLoading
                    type="bubbles"
                    width={20}
                    height={20}
                    color="white"
                  />
                )}
              </div>
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
          </div>

          {featured && <Featured />}

          <div className="">
            <div className="flex items-center gap-x-2 mb-2">
              <LuBadgeCheck className="text-2xl text-greenBtn" />
              <div className="serif-display text-2xl">From the community</div>
            </div>
            <HeaderMenu list={list} menu={menu} handler={setMenu} />
          </div>

          {main()}
        </div>
        <div className="col-span-3 sticky top-[65px] max-h-[80vh] overflow-auto">
          {book.numberOfRating > 0 ? (
            <div className="flex flex-col gap-y-2">
              <div className="flex items-end py-2 border-b-[1px] border-dialogue ">
                <div className="flex flex-col flex-1">
                  <div className="text-4xl font-semibold serif-display text-white">
                    {book.rating}
                  </div>
                  <div className="text-smallText text-base">
                    {book.numberOfRating} reviews
                  </div>
                  <Rating
                    className="!text-3xl"
                    value={book.rating}
                    precision={0.1}
                    readOnly
                  />
                </div>
                <div className="flex-0 border-smallText border-b-[1px]">
                  <BarsDataset data={chart} />
                </div>
              </div>
              <RatingDisplay value={book.content} label="Content" />
              <RatingDisplay value={book.developement} label="Development" />
              <RatingDisplay value={book.writing} label="Writing" />
              <RatingDisplay value={book.insights} label="Insights" />
            </div>
          ) : (
            <div className="serif-display mb-2">
              This book hasn't received any rating
            </div>
          )}

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
