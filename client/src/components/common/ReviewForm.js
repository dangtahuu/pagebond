import React, { useState } from "react";
import { useAppContext } from "../../context/useContext";
import { MdAddPhotoAlternate, MdCancel } from "react-icons/md";

import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";
import Rating from "@mui/material/Rating";
import { IoIosHelpCircle } from "react-icons/io";
import Tooltip from "@mui/material/Tooltip";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { AiOutlineInfoCircle } from "react-icons/ai";

const toolTipText = {};

const ReviewForm = ({
  input = "",
  setInput = (event) => {},
  setOpenModal = (event) => {},
  attachment = "",
  setAttachment = (event) => {},
  createNewPost = () => {},
  handleEditPost = () => {},
  isEditPost = false,
  imageEdit = null,
  setFormDataEdit = (event) => {},
  setImageEdit = (event) => {},
}) => {
  const [image, setImage] = useState(imageEdit);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  const handleImage = async (e) => {
    setLoading(true);
    try {
      setImage(null);
      const file = e.target.files[0];
      // @ts-ignore
      setImage({ url: URL.createObjectURL(file) });

      let formData = new FormData();
      formData.append("image", file);

      if (isEditPost) {
        setFormDataEdit(formData);
      } else {
        // @ts-ignore
        setFormData(formData);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleButton = () => {
    if (isEditPost) {
      // Edit post
      handleEditPost();
    } else {
      // Create post
      // @ts-ignore
      createNewPost(formData);
    }
    setInput({
      title: "",
      text: "",
      rating: "",
      content: "",
      development: "",
      pacing: "",
      writing: "",
      insights: "",
      dateRead: "",
    });
    setOpenModal(false);
    setAttachment("");
    setFormData(null);
  };

  const uploadImage = () => {
    if (image) {
      return (
        <div className="h-full relative group ">
          <img
            // @ts-ignore
            src={image.url}
            alt="xasdws"
            className="flex items-center rounded-lg justify-center max-h-full "
          />
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 hidden group-hover:flex mb-1 z-[203] cursor-pointer "
            onClick={() => {
              setImage(null);
              // setImageEdit(null);
              setInput((prev) => ({ ...prev, image: null }));
              setFormData(null);
              setFormDataEdit(null);
            }}
          />
        </div>
      );
    }
    if (loading) {
      return (
        <div className="flex items-center justify-center w-full h-full ">
          <ReactLoading
            type="spinningBubbles"
            color="#6A7583"
            height={50}
            width={50}
          />
        </div>
      );
    }
    return (
      <>
        <div className="w-full h-full rounded-md flex flex-col items-center justify-center relative bg-inputBg group-hover:bg-[#d9dadc]/60">
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 cursor-pointer mb-1 z-[203] "
            onClick={() => {
              setAttachment("");
            }}
          />
          <div>
            <MdAddPhotoAlternate className="w-8 h-8 rounded-full dark:bg-[#5A5C5C] p-1.5 text-black/60 bg-[#D8DADF] " />
          </div>
          <div className="font-semibold text-base leading-5 text-black/60 mt-2 ">
            Add photos
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="absolute w-full h-full top-0 left-0 z-[201] cursor-pointer opacity-0 "
          onChange={(e) => handleImage(e)}
        />
      </>
    );
  };

  const RatingBox = ({ criteria }) => {
    return (
      <div className="mb-2 relative">
        <Tooltip title="aaaa" placement="top-start">
          <div className="flex items-center">
            <label className="form-label">
              {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
            </label>
            <IoIosHelpCircle className="text-lg ml-2 cursor-pointer" />
          </div>
        </Tooltip>

        <div className="mt-1">
          <div className="flex items-center">
            <Rating
              precision={0.5}
              name="simple-controlled"
              value={input[criteria]}
              onChange={(event, newValue) => {
                setInput((prev) => ({ ...prev, [criteria]: newValue }));
              }}
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          if (!isEditPost) {
            setOpenModal(false);
          }
        }}
      ></div>
      <div className="mx-auto w-[80%] max-h-[90%] overflow-auto bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div className="">
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue">
            {isEditPost ? "Edit review" : "Create review"}
          </div>

          <div className="mt-3 grid grid-cols-3 ">
            <RatingBox criteria={"content"} />
            <RatingBox criteria={"development"} />
            <RatingBox criteria={"pacing"} />
            <RatingBox criteria={"writing"} />
            <RatingBox criteria={"insights"} />
            <RatingBox criteria={"rating"} />
          </div>

          <label className="form-label" for="title">
            Give it a title *
          </label>
          <textarea
            id="title"
            value={input.title}
            className={`standard-input`}
            placeholder={`Title`}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, title: e.target.value }));
            }}
          />

          <label className="form-label" for="text">
            Write your thoughts *
          </label>

          <textarea
            id="text"
            value={input.text}
            className={`standard-input h-[120px]`}
            placeholder={`Review`}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, text: e.target.value }));
            }}
          />

          <label className="form-label" for="dateRead">
            You read this on
          </label>

          {/* <input type="date" id="dateRead" name="datepicker"></input> */}
          <input
            type="date"
            id="dateRead"
            name="datepicker"
            value={input.dateRead}
            className={`standard-input mb-2`}
            // placeholder={`Review`}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, dateRead: e.target.value }));
            }}
          />

          {attachment && (
            <div className="relative flex w-full h-[100px] rounded-lg group ">
              {uploadImage()}
            </div>
          )}
          {!attachment && (
            <div className="flex items-center cursor-pointer">
              <label className="form-label cursor-pointer" for="">
                Attachment
              </label>

              <MdOutlineAddPhotoAlternate
                className="text-xl ml-2"
                onClick={() => {
                  setAttachment("photo");
                }}
              />
            </div>
          )}

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
              disabled={
                !input.text ||
                !input.title ||
                !input.rating ||
                !input.content ||
                !input.development ||
                !input.pacing ||
                !input.writing ||
                !input.insights ||
                loading
              }
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

export default ReviewForm;
