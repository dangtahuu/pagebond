import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useAppContext } from "../../context/useContext";

const ShelvesForm = ({
  shelves = [],
  setShelves,
  selected = [],
  submitShelves = () => {},
  setOpenModal = (event) => {},
  book = "",
}) => {
  const { autoFetch } =
    useAppContext();
  const [selectedOptions, setSelectedOptions] = useState(selected);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(shelves);
  }, [shelves]);

  const handleOptionChange = (event) => {
    const optionValue = event.target.value;
    const isSelected = selectedOptions.includes(optionValue);

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
  };

  const handleNewShelf = async () => {
    setLoading(true);

    try {
      const { data } = await autoFetch.post("/api/shelf/create-shelf", {
        name: text,
      });
      setShelves((prev) => [...prev, data.shelf]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setText("");
    }
  };

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
        <div className="">
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue ">
            Add to shelves
          </div>
          <div className="flex justify justify-center	items-center my-3 gap-x-3">
            <input
              className={`standard-input w-[250px] h-[30px] mt-0`}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              className={`primary-btn bg-black h-[30px] w-[50px] `}
              disabled={!text || loading}
              onClick={handleNewShelf}
            >
              {" "}
              Add
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
                      className="checkbox"
                    />
                    <label
                      key={shelf._id}
                      for={shelf.name}
                      class="ml-2 text-base"
                    >
                      {shelf.name}
                    </label>
                  </div>
                );
              })}
            </div>
            <button
              className="primary-btn w-[100px] ml-auto my-3"
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

export default ShelvesForm;
