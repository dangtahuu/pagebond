import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/useContext";
import { MdAddPhotoAlternate, MdCancel } from "react-icons/md";

import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { Tooltip } from "@mui/material";
import { AiOutlineInfoCircle } from "react-icons/ai";


const GiftForm = ({ points, setOpenModal, setPoints, submitHandle }) => {


  const handleButton = () => {
    submitHandle(points)
    setOpenModal(false);

  };

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
            setOpenModal(false);
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
            Gift points
          </div>

          <label className="form-label mt-3" for="text">
            Points
          </label>
          <textarea
            id="text"
            value={points}
            className={`standard-input`}
            placeholder={`Enter the points you want to gift this user`}
            onChange={(e) => {
            setPoints(e.target.value)
            }}
          />
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
              disabled={!points}
              onClick={handleButton}
            >
              Send
            </button>
          </div>
      </div>
    </div>
    </div>

  );
};

export default GiftForm;
