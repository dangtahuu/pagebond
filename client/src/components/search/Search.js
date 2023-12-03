import React from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import axios from "axios";

function Search() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { autoFetch, user, token, dark, setNameAndToken, setOneState } =
    useAppContext();
  const [bookLoading, setBookLoading] = useState(false);
  const [userloading, setUserLoading] = useState(false);

  const [text, setText] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [userResults, setUserResults] = useState([]);

  const [bookPage, setBookPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [googleMode, setGoogleMode] = useState(false);
  const [hasMoreBooksData, setHasMoreBooksData] = useState(false);
  const [hasMoreUsersData, setHasMoreUsersData] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const list = ["Books", "Users"];
  const [menu, setMenu] = useState("Books");
  const [term, setTerm] = useState("")

  const handleSearch = async () => {
    setBookPage(0);
    setUserPage(0);
    setGoogleMode(false);
    setBookLoading(true);
    setUserLoading(true);
    setTerm(text)
    try {
      const [{ data: booksData }, { data: usersData }] = await Promise.all([
        autoFetch.get(`/api/book/search-book/?term=${text}`),
        autoFetch.get(`/api/auth/search-user/?term=${text}`),
      ]);
      if (booksData.books.length < booksData.perPage) {
        setHasMoreBooksData(false);
      } else {
        setHasMoreBooksData(true);
      }
      setBookResults(booksData.books);
      if (usersData.users.length < usersData.perPage) {
        setHasMoreUsersData(false);
      } else {
        setHasMoreUsersData(true);
      }
      setUserResults(usersData.users);
    } catch (e) {
      console.log(e);
    } finally {
      setBookLoading(false);
      setUserLoading(false);
      setHasSearched(true);
      setText("")
    }
  };

  const loadMoreBooks = async () => {
    setBookLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/book/search-book/?term=${term}&page=${bookPage + 1}`
      );
      if (data.books.length < data.perPage) {
        setHasMoreBooksData(false);
      } else {
        setHasMoreBooksData(true);
      }

      setBookResults((prev) => [...prev, ...data.books]);
      setBookPage((prev) => prev++);
    } catch (e) {
      console.log(e);
    } finally {
      setBookLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    setUserLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/auth/search-user/?term=${term}&page=${userPage + 1}`
      );
      if (data.users.length < data.perPage) {
        setHasMoreUsersData(false);
      } else {
        setHasMoreUsersData(true);
      }

      setUserResults((prev) => [...prev, ...data.users]);
      setUserPage((prev) => prev++);
    } catch (e) {
      console.log(e);
    } finally {
      setUserLoading(false);
    }
  };

  const handleGoogleSearch = async () => {
    setBookLoading(true);
    setGoogleMode(true);
    try {
      // const response = await axios.get(
      //   `https://www.googleapis.com/books/v1/volumes?q=${text}`
      // );
      // const results = response.data.items || [];
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${term}`
      );
      const res = await response.json()
      // Add the items to array_2
      setBookResults(res.items);
    
    } catch (e) {
      console.log(e);
    } finally {
      setBookLoading(false);
    }
  };


  const blankBookScreen = () => {
    return (
      <>
        <img
          class="w-[35%] m-auto block"
          src="images/search-screen.png"
          alt=""
        />
        {hasSearched && (
          <div class="w-[35%] m-auto block mt-10 text-center">
            Sorry we didn't find anything
            {!googleMode &&  <div class="mt-3 font-bold cursor-pointer" onClick={handleGoogleSearch}>
              Try searching with Google Books?
            </div>}
           
          </div>
        )}
      </>
    );
  };

  const blankUserScreen = () => {
    return (
      <>
        <img
          class="w-[35%] m-auto block"
          src="images/search-screen.png"
          alt=""
        />
        {hasSearched && (
          <div class="w-full m-auto block mt-10 text-center">
            Sorry we didn't find anything with the keyword "{term}"
          </div>
        )}
      </>
    );
  };

  const result = () => {
    if (menu === "Books" && !googleMode) {
      if (bookResults.length !== 0)
        return (
          <>
            <div>
              <div className="font-bold text-xl mb-3">Showing book results for "{term}"</div>
              {bookResults.map((a) => {
                return (
                  // @ts-ignore

                  <div
                    className="flex h-auto flex-col items-center mb-3 bg-white border border-gray-200 rounded-lg shadow md:flex-row w-full hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    key={a._id}
                  >
                    <img
                      className="object-cover cursor-pointer w-full rounded-t-lg h-80 md:h-auto md:w-20 md:rounded-none md:rounded-l-lg"
                      src={
                        a.thumbnail ||
                        "https://sciendo.com/product-not-found.png"
                      }
                      alt=""
                      onClick={() => navigate(`/book/${a._id}`)}
                    />
                    <div className="flex flex-col justify-between p-2 leading-normal">
                      <p
                        className="mb-1 text-[16px] cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                        // onClick={() => navigate(`/book/${a.postedBy._id}`)}
                      >
                        {a.title}
                      </p>
                      <p
                        className="mb-1 text-[16px] cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                        // onClick={() => navigate(`/book/${a.postedBy._id}`)}
                      >
                        {a.author}
                      </p>
                    </div>
                  </div>
                );
              })}
              {hasMoreBooksData &&
                (
                  <button
                    // type="submit"
                    class="text-white block m-auto w-[140px] bg-[#B0926A] hover:bg-[#706233] focus:outline-none font-medium rounded-full text-sm px-4 py-2"
                    onClick={loadMoreBooks}
                  >
                    Load more
                  </button>
                )}

            </div>
          </>
        );
      else return <>{blankBookScreen()}</>;
    } 
    else if (menu === "Books" && googleMode) {
      if (bookResults.length !== 0)
      return (
        <>
          <div>
          <div className="font-bold text-xl mb-3">Showing Google Books results for "{term}"</div>

            {bookResults.map((a) => {
              return (
                // @ts-ignore

                <div
                  className="flex h-auto flex-col items-center mb-3 bg-white border border-gray-200 rounded-lg shadow md:flex-row w-full hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  key={a.id}
                >
                  <img
                    className="object-cover cursor-pointer w-full rounded-t-lg h-80 md:h-auto md:w-20 md:rounded-none md:rounded-l-lg"
                    src={
                      a.volumeInfo?.imageLinks?.thumbnail ||
                      "https://sciendo.com/product-not-found.png"
                    }
                    alt=""
                    onClick={() => navigate(`/book/${a.id}`)}
                  />
                  <div className="flex flex-col justify-between p-2 leading-normal">
                    <p
                      className="mb-1 text-[16px] cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                      // onClick={() => navigate(`/book/${a.postedBy._id}`)}
                    >
                      {a.volumeInfo.title}
                    </p>
                    <p
                      className="mb-1 text-[16px] cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                      // onClick={() => navigate(`/book/${a.postedBy._id}`)}
                    >
                      {a.volumeInfo.authors[0]}
                    </p>
                  </div>
                </div>
              );
            })}

           
          </div>
        </>
      );
    else return <>{blankBookScreen()}</>;
    }
    else {
      if (userResults.length !== 0)
        return (
          <div>
              <div className="font-bold text-xl mb-3">Showing user results for "{term}"</div>

            {userResults.map((a) => {
              return (
                // @ts-ignore

                <div
                  className="flex h-[100px] flex-col items-center mb-3 bg-white border border-gray-200 rounded-lg shadow md:flex-row w-full hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  key={a._id}
                >
                  <img
                    className="object-cover cursor-pointer w-full rounded-full h-80 md:h-auto md:w-20 ml-2"
                    src={
                      a.image.url || "https://sciendo.com/product-not-found.png"
                    }
                    alt=""
                    onClick={() => navigate(`/profile/${a.id}`)}
                  />
                  <div className="flex flex-col justify-between p-2 leading-normal">
                    <p
                      className="mb-1 flex items-center text-[16px] cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                      // onClick={() => navigate(`/book/${a.postedBy._id}`)}
                    >
                      {a.name}
                      {a.role === "Admin" && (
                        <TiTick className="text-sm ml-1 text-white rounded-full bg-blue-700 " />
                      )}
                    </p>
                    <p
                      className="mb-1 text-[16px] cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                      // onClick={() => navigate(`/book/${a.postedBy._id}`)}
                    >
                      {a.about}
                    </p>
                  </div>
                </div>
              );
            })}
            {hasMoreUsersData && (
              <button
                // type="submit"
                class="text-white block m-auto w-[140px] bg-[#B0926A] hover:bg-[#706233] focus:outline-none font-medium rounded-full text-sm px-4 py-2"
                onClick={loadMoreUsers}
              >
                Load more
              </button>
            )}
          </div>
        );
      else return <>{blankUserScreen()}</>;
    }
  };
  return (
    <div
      className={`md:flex w-screen bg-white min-h-screen dark:bg-black dark:text-white pt-[65px] px-[3%] sm:px-[5%] md:px-[10%]`}
    >
      {/* <div className="w-full h-[90%] mt-[3%] pt-3 bg-white  rounded-lg items-start justify-center py-16 px-4 overflow-y-auto"> */}
      <div className="w-full mt-[3%] pt-3 items-start justify-center py-16 px-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-4 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            // type="text"
            id="default-search"
            class="block w-full p-4 pl-12 ps-10 text-sm text-gray-900  focus:ring-black rounded-full bg-gray-50 "
            placeholder="Search something"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            class="text-white absolute right-4 end-2.5 bottom-2.5 bg-black hover:bg-gray-700 focus:outline-none font-medium rounded-full text-sm px-4 py-2"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div className="mt-4">
          <div className="flex mx-0 sm:mx-10 mb-10">
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
          {result()}
        </div>
      </div>
    </div>
  );
}

export default Search;
