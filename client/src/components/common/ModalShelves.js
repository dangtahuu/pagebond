import React, { useState } from "react";

import { MdCancel } from "react-icons/md";

const ModalShelves = ({
  shelves = [],
  selected = [],
  submitShelves = () => {},
  setOpenModal = (event) => {},

  book,
}) => {
  const [selectedOptions, setSelectedOptions] = useState(selected);

  const handleOptionChange = (event) => {
    const optionValue = event.target.value;
    console.log(optionValue);
    const isSelected = selectedOptions.includes(optionValue);
    console.log(isSelected);

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
    submitShelves(data);
    setOpenModal(false);
    // Send data to server
  };

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen dark:bg-black/50 bg-white/50 z-[1000] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          setOpenModal(false);
        }}
      ></div>
      <div className="mx-auto w-[90%] sm:w-[66%] md:w-[33%] bg-white dark:bg-[#242526] rounded-xl px-4 z-[202] box-shadow relative ">
        <MdCancel
          className="absolute top-4 right-6 text-[30px] opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div className="POST ">
          <div className="font-extrabold py-4 text-xl text-center border-b-[1px] border-black/20 dark:border-white/20 ">
            Add to Shelve
          </div>
          {/* Add to shelve here */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mt-4 space-y-2">
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
              className="w-full py-1.5 text-center rounded-[4px] font-semibold my-3
                            bg-[#3982E4] text-white"
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
