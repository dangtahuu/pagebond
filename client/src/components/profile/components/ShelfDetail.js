import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadingCard } from "../..";
import { ModalShelf } from "../..";
import {CgRename} from "react-icons/cg";
import {AiOutlineDelete} from 'react-icons/ai'

const ShelfDetail = ({
  dark,
  shelf,
  autoFetch,
  navigate,
  userId
}) => {
  const initList = {
    title: "",
    author: "",
    thumbnail: "",
    code: "",
  };

  const [loading, setLoading] = useState(false);
  const [listBook, setListBook] = useState([initList]);
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [openModal, setOpenModal] = useState(false)
  useEffect(() => {
    getBooks();
  }, []);

  const getBooks = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/shelf/get-shelf/${shelf}`);
      setListBook(data.shelf.books);
      setTitle(data.shelf.name)
      setText(data.shelf.name)
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  if (loading) {
    return <LoadingCard />;
  }

  const renameShelf = async () => {
    setLoading(true);

    try {
      const { data } = await autoFetch.post("/api/shelf/edit-shelf", {
        name: text,
        shelfId: shelf,
      });
      toast.success(data?.msg);
      
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const deleteShelf = async () => {

    try {
      const { data } = await autoFetch.post("/api/shelf/delete-shelf", {
        shelfId: shelf,
      });
      navigate(`/profile/${userId}`)
      toast.success(data?.msg);
      
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <LoadingCard />;
  }
  return (
    <div
      className={`bg-white w-full dark:bg-[#242526] p-4 rounded-lg ${
        !dark ? "shadow-post" : ""
      } `}
    >

      <div className="flex justify-between">
        <div className="text-2xl font-extrabold dark:text-[#e4e6eb] ">
          {title}
        </div>
        <div className="flex gap-x-3">
       
        <button
                    className='flex gap-x-2 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm'
                    onClick={() => {
                        setOpenModal(true);
                      }}>
                    <CgRename className=' ' />
                    Rename
                </button>

                <button
                    className='flex gap-x-2 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm'
                    onClick={() => {
                        if (window.confirm("Do you want to delete this shelf?")) {
                            deleteShelf()
                        }
                    }
                      }>
                    <AiOutlineDelete className=' ' />
                    Delete
                </button>

      
        </div>
       
      </div>
      {openModal && (
        <ModalShelf
          text={text}
          setOpenModal={setOpenModal}
          setText={setText}
          submitHandle={renameShelf}
          isEditPost={true}
       
        />
      )}
      {listBook.length > 0 ? (
        <div className="sm:grid grid-cols-2 grid-cols-3 my-4 gap-1 ">
          {listBook.map((p) => (
            <Book
              autoFetch={autoFetch}
              navigate={navigate}
              p={p}
              key={p._id + "asdqweqw"}
            />
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

export function Book({
  p,
  navigate,
 
}) {

  const navigateToBookPage = (bookId) => {
    navigate(`/book/${bookId}`);
  };



  return (
    <div
      key={`${p._id}daskfhqw`}
      className="col-span-1 flex items-center gap-x-3 px-1 sm:px-2 md:px-4 py-2 md:py-5 "
    >
      <img
        src={p.thumbnail}
        alt=""
        className="w-10 sm:w-16 md:w-20 h-10 sm:h-16 md:h-20 rounded-md object-cover cursor-pointer "
        onClick={() => navigateToBookPage(p.code)}
      />
      <div className="">
        <div
          className="text-sm sm:text-base font-semibold cursor-pointer "
          onClick={() => navigateToBookPage(p.code)}
        >
          {p.title.slice(0,30)}
        </div>
        <div className="text-xs sm:text-sm dark:text-[#b0b3b8]  ">
          {p.author.slice(0,30)}
        </div>
      </div>
    </div>
  );
}
