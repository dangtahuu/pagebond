import React, { useRef } from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import ShelvesForm from "../../components/common/ShelvesForm";
import { Rating, Tooltip } from "@mui/material";
import { VscOpenPreview } from "react-icons/vsc";
import Post from "../../components/common/Post";
import ReactLoading from "react-loading";
import { LuBadgeCheck } from "react-icons/lu";
import { AiOutlineMessage } from "react-icons/ai";
import { toast } from "react-toastify";

import { TbEyeglass } from "react-icons/tb";
import { BsBookmarkPlus } from "react-icons/bs";
import useOnClickOutside from "../../hooks/useOnClickOutside";


import {LeftBook, RightBook, MainBook, CarouselBook, InformationBook, Featured} from "../../components/index"

function BookPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { autoFetch, openModal,setOneState } =
    useAppContext();
  const [loading, setLoading] = useState(false);
  const [openShelf, setOpenShelf] = useState(false);
  const [openUpNext, setOpenUpNext] = useState(false);

  useEffect(() => {
    setOneState("openModal", openShelf);
  }, [openShelf]);

  useEffect(() => {
    setOneState("openModal", openUpNext);
  }, [openUpNext]);

  const [status, setStatus] = useState({
    "to read": false,
    favorites: false,
    "up next": false,
  });

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

  const [featured, setFeatured] = useState({});

  const [similarBooks, setSimilarBooks] = useState([]);
  const [promptList, setPromptList] = useState([]);
 

  const promptRef = useRef();
  const exceptRef = useRef();

  // useOnClickOutside(
  //   promptRef,
  //   () => {
  //     setPromptOpen(false);
  //   },
  //   exceptRef
  // );

  let chatInfo = {
    name: "Assistant",
    _id: "658370b92d1567e8c71e3f39",
    image: {
      url: "http://res.cloudinary.com/dksyipjlk/image/upload/v1703112987/u30vyxopnjiwhbeso75w.webp",
    },
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getBook();
        getBoooksByAuthor();
        getSimilarBooks(data.author);
      } catch (error) {
        // Handle errors if necessary
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // useEffect(() => {
  //   getPromptsForBook();
  // }, [id]);

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

  // const getPromptsForBook = async () => {
  //   setPromptLoading(true);
  //   try {
  //     const { data } = await autoFetch.get(`/api/book/get-book-prompts/${id}`);
  //     setPromptList(data.prompts);
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   setPromptLoading(false);
  // };

  

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
      <div className="w-full mt-[3%] pt-3  md:grid grid-cols-10 items-start justify-center gap-x-8 py-16 px-4">
        <div className={`col-span-2 md:pr-8 sticky top-[65px] ${openShelf && "z-[100000]"}`}>
          <LeftBook book={book} bookId={id} status={status} setStatus={setStatus} openShelf={openShelf} setOpenShelf={setOpenShelf}/>
        </div>

        <div className="col-span-5">
          <InformationBook book={book} />

          {featured && <Featured bookId={id} />}

          <MainBook id={id} book={book} setStatus={setStatus} />
        </div>

        <div className={`col-span-3 sticky top-[65px] max-h-[80vh] overflow-auto ${openUpNext && "z-[100000]"}`}>
         <RightBook book={book} openUpNext={openUpNext} setOpenUpNext={setOpenUpNext}/>
        </div>
      </div>

      <div className="w-full mt-[3%] pt-3  ">
        {booksByAuthor ? (
          <CarouselBook name="From the author" books={booksByAuthor} />
        ) : (
          <></>
        )}
      </div>

      <div className="w-full mt-[3%] pt-3  ">
        {similarBooks ? (
          <CarouselBook name="Similar Books" books={similarBooks} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default BookPage;
