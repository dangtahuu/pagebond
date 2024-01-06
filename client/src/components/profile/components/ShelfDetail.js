import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LoadingCard } from "../..";
import SimpleForm from "../../common/SimpleForm";
import { CgRename } from "react-icons/cg";
import { AiFillHeart, AiOutlineDelete, AiOutlineHeart } from "react-icons/ai";
import { Rating } from "@mui/material";
import { formatDate } from "../../../utils/formatDate";
import ReactLoading from "react-loading";
import { IoClose, IoFilterOutline } from "react-icons/io5";
import { MdOutlineStarOutline } from "react-icons/md";
import { useAppContext } from "../../../context/useContext";
import { useLocation, useNavigate } from "react-router-dom";
import useOnClickOutside from "../../../hooks/useOnClickOutside";

const ShelfDetail = ({ shelfId, userId }) => {
  const initList = {
    title: "",
    author: "",
    thumbnail: "",
    _id: "",
    userRating: "",
    dateRead: "",
  };

  const { autoFetch, setNameAndToken, token, user: own } = useAppContext();
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sort = searchParams.get("sort") || "order";

  const [loading, setLoading] = useState(false);
  const [listBook, setListBook] = useState([initList]);
  const [shelf, setShelf] = useState("");
  const [text, setText] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [filterBox, setFilterBox] = useState(false);

  const sortList = {
    Default: "order",
    "Newly added": "-order",
    "A-Z": "title",
    "Z-A": "-title",
    "Highest rating": "-rating",
    "Lowest rating": "rating",
  };
  const filterRef = useRef();
  const exceptionRef = useRef();
  useOnClickOutside(filterRef, () => setFilterBox(false), exceptionRef);

  let likeCount = shelf?.likes?.length || 0;

  useEffect(() => {
    getShelf();
  }, [shelfId, sort]);

  const getShelf = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-shelf/${shelfId}?sort=${sort}`
      );

      setShelf(data.shelf);
      setListBook(data.shelf.books);
      setText(data.shelf.name);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const renameShelf = async () => {
    try {
      const { data } = await autoFetch.patch("/api/shelf/edit-shelf", {
        name: text,
        shelfId: shelfId,
      });
      toast.success("Rename shelf successfully!");
      setShelf((prev) => ({ ...prev, name: data.shelf.name }));
    } catch (error) {
      console.log(error);
    }
  };

  const deleteShelf = async () => {
    try {
      const { data } = await autoFetch.post("/api/shelf/delete-shelf", {
        shelfId: shelfId,
      });
      navigate(`/profile/${userId}`);
      toast.success(data?.msg);
    } catch (error) {
      console.log(error);
    }
  };

  const removeFromShelf = async (id) => {
    try {
      const { data } = await autoFetch.patch("/api/shelf/remove", {
        shelfId: shelfId,
        bookId: id,
      });
      const newList = listBook.filter((one) => one._id !== id);
      setListBook(newList);
    } catch (error) {
      console.log(error);
    }
  };

  const makeFeatured = async (id) => {
    try {
      const { data } = await autoFetch.put("/api/auth/feature", {
        shelfId: shelfId,
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log(data.user);
      console.log(token);
      setNameAndToken(data.user, token);
    } catch (error) {
      console.log(error);
    }
  };

  const unlike = async () => {
    try {
      const { data } = await autoFetch.put(`/api/shelf/unlike`, {
        shelfId,
      });
      setShelf(data.shelf);
    } catch (error) {
      console.log(error);
    }
  };

  const like = async () => {
    try {
      const { data } = await autoFetch.put(`/api/shelf/like`, {
        shelfId,
      });
      setShelf(data.shelf);
    } catch (error) {
      console.log(error);
    }
  };

  const FilterBox = () => {
    return (
      <div
        ref={filterRef}
        className="absolute p-3 z-[150] rounded-lg right-0 top-[32px] w-[400px] bg-dialogue"
      >
        <>
          <div className="text-sm font-bold mb-2">Sort reviews</div>
          <div>
            {Object.keys(sortList).map((one) => (
              <div
                onClick={() => {
                  navigate(
                    `/profile/${userId}/${shelfId}?view=shelves&sort=${sortList[one]}`
                  );
                }}
                key={sortList[one]}
                className={`pill my-1 mr-1 ${
                  sort === sortList[one] ? "bg-greenBtn" : "bg-mainbg"
                } `}
              >
                {one}
              </div>
            ))}
          </div>
        </>
      </div>
    );
  };

  const BookCard = ({ data }) => {
    return (
      <div
        className="flex h-auto relative flex-col items-center mb-3 md:flex-row w-full"
        key={data?._id}
      >
        <img
          className="cursor-pointer rounded-t-lg h-[120px] w-20 md:rounded-l-lg"
          src={data?.thumbnail || "https://sciendo.com/product-not-found.png"}
          alt=""
          onClick={() => navigate(`/book/${data?._id}`)}
        />
        <IoClose
          className="text-sm cursor-pointer bg-mainbg rounded-full absolute -top-[5px] "
          onClick={() => {
            removeFromShelf(data?._id);
          }}
        />
        <div className="flex flex-col max-w-[200px] gap-y-2 justify-between p-2 leading-normal">
          <p
            className="text-xs cursor-pointer font-semibold"
            onClick={() => navigate(`/book/${data?._id}`)}
          >
            {data?.title.slice(0, 50)}
          </p>
          <p className="text-xs">{data?.author}</p>

          {data?.rating && (
            <Rating
              className="!text-sm"
              value={data?.rating}
              precision={0.1}
              readOnly
            />
          )}
        
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full bg-mainbg flex justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );
  }
  return (
    <div className={`w-full p-4`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-x-4">
          <div className="serif-display text-2xl ">{shelf.name}</div>

          {own._id !== userId && (
            <div className="flex items-center gap-x-2">
              {!shelf?.likes?.includes(own?._id) ? (
                <>
                  <AiOutlineHeart
                    onClick={() => like()}
                    className="cursor-pointer text-[18px] text-[#65676b] dark:text-[#afb0b1]"
                  />
                  <span className="like-count">
                    {`${likeCount} like${likeCount > 1 ? "s" : ""}`}
                  </span>
                </>
              ) : (
                <>
                  <AiFillHeart
                    onClick={() => unlike()}
                    className="cursor-pointer text-[18px] text-[#c22727]"
                  />
                  <span className="like-count">
                    {likeCount > 1
                      ? `You and ${likeCount - 1} other${
                          likeCount > 2 ? "s" : ""
                        }`
                      : `You`}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-x-3">
          <div className="flex gap-x-3">
            {own._id === userId && (
              <>
                {own.featuredShelf !== shelfId && shelf.type !== 1 && (
                  <button
                    className="primary-btn bg-black"
                    onClick={() => {
                      makeFeatured();
                    }}
                  >
                    <MdOutlineStarOutline className=" " />
                    Make featured
                  </button>
                )}

                {shelf.type == 3 && (
                  <>
                    <button
                      className="primary-btn bg-black"
                      onClick={() => {
                        setOpenModal(true);
                      }}
                    >
                      <CgRename className=" " />
                      Rename
                    </button>

                    <button
                      className="primary-btn bg-black"
                      onClick={() => {
                        if (
                          window.confirm("Do you want to delete this shelf?")
                        ) {
                          deleteShelf();
                        }
                      }}
                    >
                      <AiOutlineDelete className=" " />
                      Delete
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="relative">
            <div ref={exceptionRef}>
              <IoFilterOutline
                onClick={() => {
                  setFilterBox((prev) => !prev);
                }}
                className="text-xl cursor-pointer block ml-auto"
              />
            </div>

            {filterBox && <FilterBox />}
          </div>
        </div>
      </div>
      {openModal && (
        <SimpleForm
          text={text}
          title="Shelf"
          setOpenModal={setOpenModal}
          setText={setText}
          submitHandle={renameShelf}
          isEditPost={true}
          label="Name"
          placeholder="Give it a name"
        />
      )}
      {listBook.length > 0 ? (
        <div className="sm:grid grid-cols-3 my-4 gap-1 ">
          {listBook.map((one) => (
            <BookCard data={one} key={one._id} />
          ))}
        </div>
      ) : (
        <div className=" w-full text-center my-5  ">
          This shelf currently has no book!
        </div>
      )}
    </div>
  );
};

export default ShelfDetail;
