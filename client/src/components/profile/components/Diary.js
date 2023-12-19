import React, { useEffect, useState } from "react";
import { LoadingCard } from "../..";
import { ModalShelf } from "../..";
import { FiFolderPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { Rating } from "@mui/material";

const formatDate = (date) => {
  const originalDate = new Date(date);
  const options = { day: "numeric", month: "long", year: "2-digit" };
  const formattedDate = originalDate.toLocaleDateString("en-US", options);
  return formattedDate;
};

const Diary = ({ userId, autoFetch, navigate }) => {
  const initList = {
    name: "",

    _id: "",
  };

  const [loading, setLoading] = useState(false);
  const [listShelf, setListShelf] = useState([initList]);
  const [openModal, setOpenModal] = useState(false);

  const [text, setText] = useState("");

  useEffect(() => {
    getDiary();
  }, []);

  const getDiary = async () => {
    console.log(`aaaaaaaaaaaaa`);
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/review/diary/${userId}`);
      setListShelf(data.posts);
      console.log("data", data.posts);
      console.log(data.posts[0].book.thumbnail);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingCard />;
  }

  return (
    <div className={`w-full p-4 rounded-lg `}>
      <div className="flex justify-between">
       
      </div>

      <div className="text-2xl text-white serif-display ">
          Yearly progress
        </div>

      <div className="flex flex-col items-center">
        <img className="w-[50%]" src="/images/diary.png" />
        <div className="flex text-xl gap-x-10">
          <div>20000 pages</div>
          <div>50 books</div>
          <div>Favorite genre</div>

        </div>
      </div>

      <div className="text-2xl text-white serif-display ">
          Diary
        </div>

      {listShelf.length > 0 ? (
        <div className="text-sm my-4 gap-1 text-bold ">
           <div className="grid grid-cols-9 gap-x-5 h-auto p-4 mb-4 bg-altDialogue rounded-lg items-center">
              <div className="col-span-1">Read on</div>
              {/* <div className="col-span-1"> </div> */}
              <div className="col-span-2 flex gap-x-2">
               Book
              </div>
              <div className="col-span-1">Pages</div>
              <div className="col-span-1">Published on</div>

              <div className="col-span-2">Publisher</div>
              <div className="col-span-1">
              Rating
              </div>
              <div className="col-span-1 flex justify-end">
                {/* <button className="">View</button> */}
              </div>
            </div>
          {listShelf.map((p) => (
            <div className="grid grid-cols-9 gap-x-5 p-4 mb-4 border-b-[1px] border-b-dialogue items-center">
              <div className="col-span-1">{formatDate(p.dateRead)}</div>
              {/* <div className="col-span-1"> </div> */}
              <div className="col-span-2 flex gap-x-2 cursor-pointer" onClick={()=>{navigate(`/book/${p.book?._id}`)}}>
                <img className="rounded-lg w-[50px]" src={p.book?.thumbnail} />
                <div className="flex flex-col justify-center">
                  <div>{p.book?.title}</div>
                  <div>{p.book?.author}</div>
                </div>
              </div>
              <div className="col-span-1">{p.book?.pageCount} pages</div>
              <div className="col-span-1">{p.book?.publishedDate}</div>

              <div className="col-span-2">{p.book?.publisher}</div>
              <div className="col-span-1">
                {" "}
                <Rating
                  className="!text-sm"
                  // name="half-rating-read"
                  value={p.rating}
                  precision={0.5}
                  readOnly
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="cursor-pointer bg-greenBtn rounded-full w-auto py-1 px-2" onClick={()=>{navigate(`/book/${p.book?._id}`)}}>View</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className=" w-full text-center my-5  ">
          User has no shelves yet!
        </div>
      )}
    </div>
  );
};

export default Diary;
