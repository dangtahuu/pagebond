import React from "react";
import { MdCancel } from "react-icons/md";

const ModalShelf = ({
  text = "",
  setText = () => {},
  setOpenModal = (event) => {},
  submitHandle = () => {},
  isEditPost = false,
}) => {
  const handleButton = () => {
    submitHandle();
    setText("");
    setOpenModal(false);
  };

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen dark:bg-black/50 bg-white/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          if (!isEditPost) {
            setOpenModal(false);
          }
        }}
      ></div>
      <div className="mx-auto w-[90%] sm:w-[66%] bg-white dark:bg-[#242526] rounded-xl px-4 z-[202] box-shadow relative ">
        <MdCancel
          className="absolute top-4 right-6 text-[30px] opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div className="POST ">
          <div className="font-extrabold py-4 text-xl text-center border-b-[1px] border-black/20 dark:border-white/20 ">
            {isEditPost ? "Edit shelf" : "Create shelf"}
          </div>
          <div className="flex flex-col gap-y-2 py-4 items-center  ">
            <textarea
              value={text}
              className={`input-modal style-3 bg-inherit focus:ring-0 border-0 w-full placeholder:text-[#a0a0a1] text-[22px]
                         relative`}
              placeholder={`Name`}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />

            <button
              className={`w-full py-1.5 text-center rounded-[4px] font-semibold my-3 ${
                text
                  ? "bg-[#3982E4] text-white "
                  : "dark:bg-[#505151] dark:text-white/70 bg-[#3982E4] text-white "
              }`}
              disabled={!text}
              onClick={handleButton}
            >
              {isEditPost ? "Save" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalShelf;
