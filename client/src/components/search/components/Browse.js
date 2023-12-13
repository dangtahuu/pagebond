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
function Browse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { autoFetch, user, token, dark, setNameAndToken, setOneState } =
    useAppContext();
  const list = {"Last week": 7, "Last month": 30, "Last year": 365, "All time":-1};

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const limit = searchParams.get("limit") || 7;
  const genre = searchParams.get("genre");

  const [popularUsers, setPopularUsers] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [filterBox, setFilterBox] = useState(false);
  const [menu, setMenu] = useState("Last week");
  const genres = [
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

  const filterRef = useRef();
  const exceptionRef = useRef();

  useOnClickOutside(filterRef, () => setFilterBox(false), exceptionRef);

  useEffect(() => {
    getPopularUsers();
    getPopularBooks();
  }, [limit, genre]);

  const getPopularUsers = async () => {
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
  };

  const getPopularBooks = async () => {
    try {
      const limitDate = limit || 7;
    //   console.log()

      if (!genre || genre == 'null') {
        const { data } = await autoFetch.get(
          `api/book/popular-books?limit=${limitDate}`
        );
        setPopularBooks(data.books);
      } else {
        const { data } = await autoFetch.get(
          `api/book/popular-books-with-genre?limit=${limitDate}&genre=${genre}`
        );
        setPopularBooks(data.books);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const menuHandler = (value) => {
    setMenu(value)
    navigate(`/browse/?limit=${list[value]}&genre=${genre}`)
  };

  return (
    <div className="min-h-[150vh]">
      <div className="flex justify-center mt-4 ">
        <HeaderMenu list={Object.keys(list)} menu={menu} handler={menuHandler} />
      </div>

      <div>
        <div className="serif-display text-2xl my-2">Popular members</div>
        <div className="grid grid-cols-5 gap-x-3">
          {popularUsers.map((person) => {
            return (
              <div
                className="flex flex-col gap-y-2 bg-dialogue rounded-lg items-center p-3 cursor-pointer"
                onClick={()=>{navigate(`/profile/${person._id}`)}}
                key={person._id}
              >
                <img
                  className="rounded-full w-[40%]"
                  src={person.image.url}
                  alt=""
                />
                <div className="font-bold">{person.name}</div>
              </div>
            );
          })}
        </div>
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
                <div className="text-sm font-bold mb-2">Filter by genres</div>
                <div>
                  {genres.map((one) => (
                    <div
                      onClick={() => {
                        if(genre!==one) navigate(`/browse/?limit=${limit}&genre=${one}`)
                        else navigate(`/browse/?limit=${limit}`);
                      }}
                      key={one}
                      className={`cursor-pointer text-xs inline-block rounded-full ${genre===one? 'bg-greenBtn':'bg-mainbg'} px-2 py-1 my-1 mr-1`}
                    >
                      {one}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
                      v.thumbnail || "https://sciendo.com/product-not-found.png"
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
      </div>
    </div>
  );
}

export default Browse;
