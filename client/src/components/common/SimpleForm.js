import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/useContext";
import { MdAddPhotoAlternate, MdCancel } from "react-icons/md";

import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";
import { Tooltip } from "@mui/material";
import { AiOutlineInfoCircle } from "react-icons/ai";

const SimpleForm = ({ checkInput, text, setOpenModal, setText, submitHandle, isEdit, label, placeholder, note, title }) => {
  const handleButton = () => {
    console.log('xxxx')
    if(checkInput) {
      const result = checkInput(text)
      if (!result) return;
    }
    submitHandle();
    setOpenModal(false);
  };

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          if (!isEdit) {
            setOpenModal(false);
          }
        }}
      ></div>
      <div className="mx-auto w-[60%] bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div>
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue ">
           {title}
          </div>

          <label className="form-label mt-3" for="text">
            {label}
          </label>
          <textarea
            id="text"
            value={text}
            className={`standard-input`}
            placeholder={placeholder}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />

          {note &&  <div className="text-sm my-2 text-smallText">{note}</div>}
         
          <div className="flex justify-between items-center mt-2 mb-3">
            <Tooltip
              title="Support the following HTML tags: <strong>, <em>, <b>, <i>, <a>, <blockquote>, <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, <ul>, <ol>, <li>, <p>, <br>"
              placement="top-start"
            >
              <div>
                <AiOutlineInfoCircle className="text-2xl" />
              </div>
            </Tooltip>
            <button
              className={`primary-btn w-[100px] block`}
              disabled={!text}
              onClick={handleButton}
            >
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleForm;
