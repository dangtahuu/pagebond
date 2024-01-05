import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadingCard } from "../..";
import SimpleForm from "../../common/SimpleForm";
import { CgRename } from "react-icons/cg";
import { AiOutlineDelete } from "react-icons/ai";
import { Rating } from "@mui/material";
import {formatDate} from "../../../utils/formatDate";
import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";

const ShelfDetail = ({ shelfId, autoFetch, navigate, userId }) => {
  const initList = {
    title: "",
    author: "",
    thumbnail: "",
    _id: "",
    userRating:"",
    dateRead:""
  };

  const [loading, setLoading] = useState(false);
  const [listBook, setListBook] = useState([initList]);
  const [shelf, setShelf] = useState({name:"",type:""})
  const [text, setText] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const getBooks = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/shelf/get-shelf/${shelfId}`);
      setListBook(data.books);
      setShelf({name: data.shelf.name},{type: data.shelf.type});
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
      setShelf((prev)=>({...prev, name: data.shelf.name}));
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
        bookId: id
      });
      const newList = listBook.filter((one)=>one._id!==id)
      setListBook(newList)
    } catch (error) {
      console.log(error);
    }
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
       <IoClose className="text-sm cursor-pointer bg-mainbg rounded-full absolute -top-[5px] "
       onClick={()=>{removeFromShelf(data?._id)}}
       />
        <div className="flex flex-col max-w-[200px] gap-y-2 justify-between p-2 leading-normal">
          <p
            className="text-xs cursor-pointer font-semibold"
            onClick={() => navigate(`/book/${data?._id}`)}
          >
            {data?.title.slice(0,50)}
          </p>
          <p className="text-xs">{data?.author}</p>

          {data?.userRating && (
            <Rating
              className="!text-sm"
              value={data?.userRating}
              precision={0.1}
              readOnly
            />
          )}
          {data?.dateRead && (
            <div className="text-xs">Read on {formatDate(data?.dateRead)}</div>
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
      <div className="flex justify-between">
        <div className="serif-display text-2xl ">{shelf.name}</div>
      {shelf.type === 3 &&
        <div className="flex gap-x-3">
        <button
          className="primary-btn flex items-center gap-x-2"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <CgRename className=" " />
          Rename
        </button>

        <button
          className="primary-btn flex items-center gap-x-2"
          onClick={() => {
            if (window.confirm("Do you want to delete this shelf?")) {
              deleteShelf();
            }
          }}
        >
          <AiOutlineDelete className=" " />
          Delete
        </button>
      </div>}
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
        <div className="sm:grid grid-cols-2 grid-cols-3 my-4 gap-1 ">
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
