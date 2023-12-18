import React from "react";
import { useAppContext } from "../../../context/useContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import axios from "axios";
import { useLocation } from "react-router-dom";
import HeaderMenu from "../../common/HeaderMenu";
import { IoFilterOutline } from "react-icons/io5";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import ReactLoading from "react-loading";
import UserCard from "../../common/UserCard";

function Browse() {
  const navigate = useNavigate();
  const { autoFetch } = useAppContext();
  const [userLoading, setUserLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);

  const list = {
    "Last week": 7,
    "Last month": 30,
    "Last year": 365,
    "All time": "All",
  };
  const ratingList = ["All", "0.5-1", "1.5-2", "2.5-3", "3.5-4", "4.5-5"];
  const pacingList = ["All", "Slow", "Medium", "Fast"];
  const pageCountList = ["All", "<250", "250-499", ">500"];

  // const [pagination, setpagination]=useState(1)

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const limit = searchParams.get("limit") || 7;
  const genre =
    JSON.parse(decodeURIComponent(searchParams.get("genre"))) || "All";
  const rating = searchParams.get("rating") || "All";
  const pacing = searchParams.get("pacing") || "All";
  const page = searchParams.get("page") || "All";
  const pagination = parseInt(searchParams.get("pagination")) || 1;

  const [hasMoreBooks, setHasMoreBooks] = useState(true);

  const [popularUsers, setPopularUsers] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [filterBox, setFilterBox] = useState(false);
  const [menu, setMenu] = useState("Last week");
  const genres = [
    "All",
    "Fiction",
    "Classics",
    "Literary",
    "Fantasy",
    "Science Fiction",
    "Self-Help",
    "Action & Adventure",
    "Thrillers",
    "Historical",
    "Romance",
    "Biography & Autobiography",
    "Young Adult Fiction",
    "Juvenile Fiction",
    "Mystery & Detective",
    "Religion",
    "Business and Economics",
    "Psychology",
    "Philosophy",
    "Poetry",
    "Women",
    "Family",
    "Science",
    "Social Themes",
    "Political Science",
  ];

  const moods = [
    "informative",
    "lighthearted",
    "challenging",
    "emotional",
    "funny",
    "sad",
    "inspiring",
    "mind-boggling",
    "adventurous",
    "introspective",
    "charming",
    "nostalgic",
    "euphoric",
    "dark",
  ];

  const filterRef = useRef();
  const exceptionRef = useRef();

  useOnClickOutside(filterRef, () => setFilterBox(false), exceptionRef);

  useEffect(() => {
    getPopularBooks();
  }, [limit, genre, rating, page, pacing, pagination]);

  useEffect(() => {
    getPopularUsers();
  }, [limit]);

  const getPopularUsers = async () => {
    setUserLoading(true);
    try {
      const limitDate = limit || 7;
      const { data } = await autoFetch.get(
        `api/auth/popular-users?limit=${limitDate}`
      );
      console.log(data.people);
      setPopularUsers(data.people);
    } catch (e) {
      console.log(e);
    }
    setUserLoading(false);
  };

  const getPopularBooks = async () => {
    setBookLoading(true);
    try {
      const { data } = await autoFetch.get(
        `api/book/popular-books?limit=${limit}&genre=${encodeURIComponent(
          JSON.stringify(genre)
        )}&rating=${rating}&pacing=${pacing}&page=${page}&pagination=${pagination}`
      );
      setPopularBooks(data.books);
      if (data.books.length < 48) setHasMoreBooks(false);
    } catch (e) {
      console.log(e);
    }
    setBookLoading(false);
  };

  const menuHandler = (value) => {
    setMenu(value);
    navigate(
      `/browse?limit=${list[value]}&genre=${encodeURIComponent(
        JSON.stringify(genre)
      )}&rating=${rating}&pacing=${pacing}&page=${page}&pagination=1`
    );
  };

  const UserSection = () => {
    if (userLoading)
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );

    return (
      <div className="grid grid-cols-5 gap-x-3">
        {popularUsers.map((person) => {
          return (
          <UserCard person={person}/>
          );
        })}
      </div>
    );
  };

  const BookSection = () => {
    if(bookLoading) 
    return <div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>

    return (
      <div>
           

            <div className="grid grid-cols-8 gap-x-1">
              {popularBooks.map((v) => {
                return (
                  <div
                    className="max-w-sm mr-5 cursor-pointer  rounded-lg overflow-hidden shadow-md hover:shadow-xl"
                    onClick={() => {
                      navigate(`/book/${v._id}`);
                    }}
                  >
                    <div className="w-full h-[140px] overflow-hidden">
                      <img
                        className="w-full h-full object-fill hover:scale-110 transition-transform duration-500 overflow-hidden"
                        src={
                          v.thumbnail ||
                          "https://sciendo.com/product-not-found.png"
                        }
                        alt=""
                      />
                    </div>
                    <div className="px-4 py-2">
                      <div className="font-bold text-xs mb-2">
                        {v.title.slice(0, 30)}
                      </div>
                      <p className="text-gray-700 text-xs">
                        {v.author ? v.author.slice(0, 20) : "Unknown author"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-10">
              <div>
                {pagination > 1 && (
                  <button
                    className="bg-altDialogue w-[80px] px-2 py-1 rounded-md text-sm"
                    onClick={() => {
                      navigate(
                        `/browse?limit=${limit}&genre=${encodeURIComponent(
                          JSON.stringify(genre)
                        )}&rating=${rating}&pacing=${pacing}&page=${page}&pagination=${
                          pagination - 1
                        }`
                      );
                    }}
                  >
                    Previous
                  </button>
                )}
              </div>
              {hasMoreBooks && (
                <button
                  className="bg-altDialogue w-[80px] px-2 py-1 rounded-md text-sm"
                  onClick={() => {
                    navigate(
                      `/browse?limit=${limit}&genre=${encodeURIComponent(
                        JSON.stringify(genre)
                      )}&rating=${rating}&pacing=${pacing}&page=${page}&pagination=${
                        pagination + 1
                      }`
                    );
                  }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
    )
  };

  return (
    <div className="min-h-[100vh]">
      <div className="flex justify-center mt-4 ">
        <HeaderMenu
          list={Object.keys(list)}
          menu={menu}
          handler={menuHandler}
        />
      </div>

      <div>
        <div className="serif-display text-2xl my-2">Popular members</div>
        <UserSection />
      </div>

      <div>
        <div className="flex justify-between items-center mt-8 mb-4">
          <div className="serif-display text-2xl ">Popular books</div>
          <div className="relative">
              <div ref={exceptionRef}>
                <IoFilterOutline
                  onClick={() => {
                    setFilterBox((prev) => !prev);
                  }}
                  className="text-xl cursor-pointer"
                />
              </div>

              {filterBox && (
                <div
                  ref={filterRef}
                  className="absolute p-3 rounded-lg right-0 top-[32px] w-[400px] bg-dialogue"
                >
                  <div className="text-sm font-bold mb-2">
                    Filter by genres or moods
                  </div>
                  <div className="border-smallText border-b-[1px] border-opacity-50 pb-1">
                    {genres.map((one) => (
                      <div
                        onClick={() => {
                          navigate(
                            `/browse?limit=${limit}&genre=${encodeURIComponent(
                              JSON.stringify(one)
                            )}&rating=${rating}&pacing=${pacing}&page=${page}&pagination=1`
                          );
                        }}
                        key={one}
                        className={`cursor-pointer text-xs inline-block rounded-full ${
                          genre === one ? "bg-greenBtn" : "bg-mainbg"
                        } px-2 py-1 my-1 mr-1`}
                      >
                        {one}
                      </div>
                    ))}
                  </div>
                  <div className="pt-1">
                    {moods.map((one) => (
                      <div
                        onClick={() => {
                          navigate(
                            `/browse?limit=${limit}&genre=${encodeURIComponent(
                              JSON.stringify(one)
                            )}&rating=${rating}&pacing=${pacing}&page=${page}&pagination=1`
                          );
                        }}
                        key={one}
                        className={`cursor-pointer text-xs inline-block rounded-full ${
                          genre === one ? "bg-greenBtn" : "bg-mainbg"
                        } px-2 py-1 my-1 mr-1`}
                      >
                        {one}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold my-1">Rating</div>

                  <div className="">
                    {ratingList.map((one) => (
                      <div
                        onClick={() => {
                          navigate(
                            `/browse?limit=${limit}&genre=${encodeURIComponent(
                              JSON.stringify(genre)
                            )}&rating=${one}&pacing=${pacing}&page=${page}&pagination=1`
                          );
                        }}
                        key={one}
                        className={`cursor-pointer text-xs inline-block rounded-full ${
                          rating === one ? "bg-greenBtn" : "bg-mainbg"
                        } px-2 py-1 my-1 mr-1`}
                      >
                        {one}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold my-1">Page count</div>

                  <div className="">
                    {pageCountList.map((one) => (
                      <div
                        onClick={() => {
                          navigate(
                            `/browse?limit=${limit}&genre=${encodeURIComponent(
                              JSON.stringify(genre)
                            )}&rating=${rating}&pacing=${pacing}&page=${one}&pagination=1`
                          );
                        }}
                        key={one}
                        className={`cursor-pointer text-xs inline-block rounded-full ${
                          page === one ? "bg-greenBtn" : "bg-mainbg"
                        } px-2 py-1 my-1 mr-1`}
                      >
                        {one}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold my-1">Pacing</div>

                  <div className="">
                    {pacingList.map((one) => (
                      <div
                        onClick={() => {
                          navigate(
                            `/browse?limit=${limit}&genre=${encodeURIComponent(
                              JSON.stringify(genre)
                            )}&rating=${rating}&pacing=${one}&page=${page}&pagination=1`
                          );
                        }}
                        key={one}
                        className={`cursor-pointer text-xs inline-block rounded-full ${
                          pacing === one ? "bg-greenBtn" : "bg-mainbg"
                        } px-2 py-1 my-1 mr-1`}
                      >
                        {one}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
        <BookSection/>

      </div>
    </div>
  );
}

export default Browse;
