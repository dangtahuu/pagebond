import React, { useEffect, useState } from "react";
import SimpleForm from "../../common/SimpleForm";
import { FiFolderPlus } from "react-icons/fi";
import {toast} from "react-toastify";
import ReactLoading from "react-loading";
import { useAppContext } from "../../../context/useContext";
import { useNavigate } from "react-router-dom";
import sliceAndPad from "../../../utils/sliceAndPad";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Shelves = ({ userId }) => {

  const { autoFetch } = useAppContext();
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true);
  const [listShelf, setListShelf] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [text, setText] = useState("");

  useEffect(() => {
    getShelves();
  }, []);

  const getShelves = async () => {
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

  function Shelf({ data }) {
    const navigateToShelfPage = (shelfId) => {
      navigate(`/profile/${userId}/${shelfId}?view=shelves`);
    };
  
    return (
      <div
        key={`${data._id}`}
        className="flex items-center gap-x-10 px-4 py-2 bg-altDialogue rounded-lg "
      >
            <div class="flex -space-x-3 rtl:space-x-reverse w-[100px] cursor-pointer"
            onClick={() => navigateToShelfPage(data._id)}>
            {sliceAndPad(data.books,4).map((one, index) => (
              <img
                className="w-[40px] h-[60px] border-[1px] border-gray-400 shadow-2xl shadow-black border-white rounded-md "
                style={{ zIndex: 4-index}}
                src={one?.thumbnail|| "https://sciendo.com/product-not-found.png"}
                alt=""
              />
            ))}
          </div>
        <div className="flex flex-col gap-y-2">
          <div
            className="text-sm sm:text-base font-semibold cursor-pointer "
            onClick={() => navigateToShelfPage(data._id)}
          >
            {data.name}
          </div>
          {data?.likes.length>0 && 
           <div className="flex items-center gap-x-2">
           <AiFillHeart
                     className="cursor-pointer text-[18px] text-[#65676b] dark:text-[#afb0b1]"
                   />
                   <span className="like-count">
                     {`${data?.likes.length} like${data?.likes.length > 1 ? "s" : ""}`}
                   </span>
           </div>}
         
        </div>
      </div>
    );
  }


  if (loading) {
    return <div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>
  }

  return (
    <div
      className={`w-full p-4 rounded-lg `}
    >
      <div className="flex justify-between">
        <div className="text-2xl font-extrabold dark:text-[#e4e6eb] ">
          Shelves
        </div>

        <button
          className="flex gap-x-2 items-center primary-btn"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <FiFolderPlus className=" " />
          New Shelf
        </button>
      </div>

      {openModal && (
        <SimpleForm
          text={text}
          title="Shelf"
          setOpenModal={setOpenModal}
          setText={setText}
          submitHandle={createShelf}
          label="Name"
          placeholder="Give it a name"
        />
      )}

      {listShelf.length > 0 ? (
        <div className="sm:grid grid-cols-2 md:grid-cols-3 my-4 gap-x-3 gap-y-2 ">
          {listShelf.map((one) => (
            <Shelf
              data={one}
              userId={userId}
              key={one._id}
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

