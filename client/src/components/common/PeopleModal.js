import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const PeopleModal = ({ people = [], setOpenModal }) => {
const navigate = useNavigate()

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[20000] top-0 left-0 ">
      <div
        className="z-[30000] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          setOpenModal(false);
        }}
      ></div>
      <div className="mx-auto w-[500px] max-h-[80%] overflow-auto style-3 bg-dialogue rounded-xl px-4 z-[40000] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div className="">
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue ">
            People
          </div>

          <div className="grid grid-cols-2 my-3 gap-x-10 ">
            {people.map((one) => (
              <div className="flex items-center justify-between">
                <div className="flex items-center cursor-pointer"
                onClick={()=>{navigate(`/profile/${one._id}`)}}
                >
                  <img
                    src={one.image.url}
                    className="rounded-full h-10 w-10 mr-2"
                  />
                  <div className="flex flex-col text-sm">
                    <div className="font-semibold">{one.name}</div>
                    <div className="text-smallText">
                      {one.books.length} books
                    </div>
                  </div>
                </div>

                <button className="ml-5 primary-btn bg-black"
                   onClick={()=>{navigate(`/profile/${one._id}`)}}
                >Visit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleModal;
