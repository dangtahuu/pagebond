import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useAppContext } from "../../context/useContext";
import { MdCancel } from "react-icons/md";

const ModalShelves = ({
  shelves = [],
  setShelves,
  selected = [],
  submitShelves = () => {},
  setOpenModal = (event) => {},
  book="",
}) => {
  const { autoFetch, user, token, dark, setNameAndToken, setOneState } =
    useAppContext();
  const [selectedOptions, setSelectedOptions] = useState(selected);
  const [text, setText] = useState("")
  const [loading,setLoading] = useState(false)

  useEffect(()=>{
    console.log(shelves)
  },[shelves])

  const handleOptionChange = (event) => {
    const optionValue = event.target.value;
    // console.log(optionValue);
    const isSelected = selectedOptions.includes(optionValue);
    // console.log(isSelected);

    if (isSelected) {
      setSelectedOptions(
        selectedOptions.filter((value) => value !== optionValue)
      );
    } else {
      setSelectedOptions([...selectedOptions, optionValue]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const all = shelves.map((x) => x._id);
    const non = all.filter((y) => !selectedOptions.includes(y));
    const data = { book: book, selected: selectedOptions, nonSelected: non };
    // console.log(data)
    submitShelves(data);
    setOpenModal(false);
    // Send data to server
  };

  const handleNewShelf = async() => {
      setLoading(true);

      try {
        const { data } = await autoFetch.post("/api/shelf/create-shelf", {
          name: text,
        });
        // console.log(data.shelf)
        setShelves((prev)=>[...prev,data.shelf]);
        // toast.success(data?.msg || "Shelf created!");
      } catch (error) {
        console.log(error);
      } finally{
        setLoading(false);
setText("")
      }
  }

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
    <div
      className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
      onClick={() => {
          setOpenModal(false);
      }}
    ></div>
    <div className="mx-auto w-[500px] bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
      <IoClose
        className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
        onClick={() => {
          setOpenModal(false);
        }}
      />
        <div className="POST ">
          <div className="font-extrabold py-4 text-xl text-center border-b-[1px] border-black/20 dark:border-white/20 ">
            Add to Shelve
          </div>
          <div className="flex justify justify-center	items-center">
          <input className="rounded h-[30px]" value={text} onChange={(e)=>setText(e.target.value)}/>
          <button
            className={`bg-black h-[30px] w-[50px] ml-3 text-white text-sm block mr-0 py-1.5 text-center rounded-full font-bold my-3`}
            // disabled={!input.text || loading}
            onClick={handleNewShelf}
            // ref={searchRef}
          > Add
            {/* {isEditPost ? "Save" : "Post"} */}
          </button>
          </div>
         
          {/* Add to shelve here */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 mt-4 gap-x-4">
              {shelves.map((shelf) => {
                return (
                  <div class="flex items-center text-base">
                    <input
                      type="checkbox"
                      name={shelf.name}
                      id={shelf.name}
                      value={shelf._id}
                      checked={selectedOptions.includes(shelf._id)}
                      onChange={handleOptionChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      key={shelf._id}
                      for={shelf.name}
                      class="ml-2 text-base font-medium text-gray-900 dark:text-gray-300"
                    >
                      {shelf.name}
                    </label>
                  </div>
                );
              })}
            </div>
            <button
              className="bg-greenBtn w-[100px] text-white text-sm block ml-auto mr-0 py-1.5 text-center rounded-full font-bold my-3"
              type="submit"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalShelves;
