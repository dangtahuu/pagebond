import { useEffect, useState } from "react";
import { BsBookmarkPlus } from "react-icons/bs";
import { TbEyeglass } from "react-icons/tb";
import { VscOpenPreview } from "react-icons/vsc";
import { useAppContext } from "../../context/useContext";
import { toast } from "react-toastify";
import ShelvesForm from "../common/ShelvesForm";
import ReactLoading from "react-loading";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import { MdOutlineFormatListNumbered } from "react-icons/md";

const Left = ({ book, bookId, status, setStatus }) => {
  const { autoFetch, user, setOneState } = useAppContext();

  const [shelves, setShelves] = useState([]);
  const [selectedShelves, setSelectedShelves] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      getShelves();
      getSelectedShelves();
      getStatus();
      setLoading(false);
    };
    getData();
  }, [bookId]);

  useEffect(() => {
    setOneState("openModal", openForm);
  }, [openForm]);

  const getShelves = async () => {
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-shelves-in-book-page/${user._id}`
      );
      setShelves(data.shelves);
    } catch (error) {
      console.log(error);
    }
  };

  const getSelectedShelves = async () => {
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/get-selected-shelves/${bookId}`
      );
      setSelectedShelves(data.ids);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatus = async () => {
    try {
      const { data } = await autoFetch.get(`/api/shelf/status/${bookId}`);
      setStatus({
        "to read": data.toRead,
        favorites: data.favorites,
        "up next": data.upNext,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const submitShelves = async (shelves) => {
    try {
      const { data } = await autoFetch.patch(
        `/api/shelf/book-to-shelf`,
        shelves
      );
      setSelectedShelves(data.selected);
      toast.success("Modify shelves successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleChangeStatus = async (name) => {
    try {
      if (status[name]) {
        console.log(name)
        await autoFetch.patch(`/api/shelf/remove-by-name`, {
          bookId,
          name
        });
        console.log(name);
        if (name === "to read")
          setStatus((prev) => ({ ...prev, [name]: false, "up next": false }));
        else setStatus((prev) => ({ ...prev, [name]: false }));
      } else {
        await autoFetch.patch(`/api/shelf/add-by-name`, {
          bookId,
          name,
        });
        console.log(name);

        if (name === "up next")
          setStatus((prev) => ({ ...prev, [name]: true, "to read": true }));
        else setStatus((prev) => ({ ...prev, [name]: true }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {openForm && (
        <ShelvesForm
          shelves={shelves}
          setShelves={setShelves}
          selected={selectedShelves}
          submitShelves={submitShelves}
          openModal={openForm}
          setOpenModal={setOpenForm}
          book={book}
        ></ShelvesForm>
      )}
      <img
        className="max-w-[400px] md:w-[200px] object-contain mb-6 md:mb-0 rounded-lg"
        src={book?.thumbnail}
        alt={`${book?.title} cover`}
      />

      {loading ? (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      ) : (
        <div className="flex flex-col mt-4 gap-y-2">
          <button
            className={`primary-btn w-[200px] bg-black`}
            onClick={() => handleChangeStatus("favorites")}
          >
            {status.favorites ? (
              <AiFillHeart className="text-[#c22727] text-lg" />
            ) : (
              <AiOutlineHeart className="text-lg text-white" />
            )}
            {status.favorites ? "Remove from Favorites" : "Add to Favorites"}
          </button>

          <button
            className={`primary-btn w-[200px] bg-black`}
            onClick={() => handleChangeStatus("to read")}
          >
            {status["to read"] ? (
              <TbEyeglass className="text-greenBtn text-lg" />
            ) : (
              <TbEyeglass className="text-lg text-white" />
            )}
            {status["to read"] ? "Remove from To Read" : "Want to read"}
          </button>

          <button
            className={`primary-btn w-[200px] bg-black`}
            onClick={() => handleChangeStatus("up next")}
          >
            {status["up next"] ? (
              <MdOutlineFormatListNumbered className="text-greenBtn text-lg" />
            ) : (
              <MdOutlineFormatListNumbered className="text-lg text-white" />
            )}
            {status["up next"] ? "Remove from Up Next" : "Add to Up Next"}
          </button>

          <button
            className={`primary-btn  w-[200px]`}
            // disabled={!text || loading}
            onClick={() => {
              setOpenForm(true);
            }}
            // onClick={handleButton}
          >
            <BsBookmarkPlus className="text-lg text-white" /> Shelve this book
          </button>
        </div>
      )}
    </>
  );
};

export default Left;
