import React, { useEffect, useState } from "react";
import { LoadingCard } from "../..";
import { ModalShelf } from "../..";
import { FiFolderPlus } from "react-icons/fi";
import {toast} from "react-toastify";

const Shelves = ({ dark, userId, autoFetch, navigate }) => {
  const initList = {
    name: "",

    _id: "",
  };

  const [loading, setLoading] = useState(false);
  const [listShelf, setListShelf] = useState([initList]);
  const [openModal, setOpenModal] = useState(false);

  const [text, setText] = useState("");

  useEffect(() => {
    getShelves();
  }, []);

  const getShelves = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/shelf/get-shelves/${userId}`);
      setListShelf(data.shelves);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const createShelf = async () => {
    setLoading(true);

    try {
      const { data } = await autoFetch.post("/api/shelf/create-shelf", {
        name: text,
      });
      setListShelf([data.shelf, ...listShelf]);
      toast.success(data?.msg || "Shelf created!");

    } catch (error) {
      console.log(error);
    }
    setLoading(false);
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
          Shelves
        </div>

        <button
          className="flex gap-x-2 items-center mr-6 font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <FiFolderPlus className=" " />
          New Shelf
        </button>
      </div>

      {openModal && (
        <ModalShelf
          text={text}
          setOpenModal={setOpenModal}
          setText={setText}
          submitHandle={createShelf}
        />
      )}

      {listShelf.length > 0 ? (
        <div className="sm:grid grid-cols-2 md:grid-cols-3 my-4 gap-1 ">
          {listShelf.map((p) => (
            <Shelf
              autoFetch={autoFetch}
              navigate={navigate}
              p={p}
              userId={userId}
              key={p._id + "asdqweqw"}
            />
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

export default Shelves;

export function Shelf({ p, navigate, userId }) {
  const navigateToShelfPage = (shelfId) => {
    navigate(`/profile/${userId}/${shelfId}`);
  };

  return (
    <div
      key={`${p._id}daskfhqw`}
      className="col-span-1 flex items-center gap-x-3 px-1 sm:px-2 md:px-4 py-2 md:py-5 "
    >
      <img
        src="https://cdn0.iconfinder.com/data/icons/colorful-school/111/08-512.png"
        alt=""
        className="w-10 sm:w-16 md:w-20 h-10 sm:h-16 md:h-20 rounded-md object-cover cursor-pointer "
        onClick={() => navigateToShelfPage(p._id)}
      />
      <div className="">
        <div
          className="text-sm sm:text-base font-semibold cursor-pointer "
          onClick={() => navigateToShelfPage(p._id)}
        >
          {p.name}
        </div>
      </div>
    </div>
  );
}
