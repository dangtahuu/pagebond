import React, { useState } from "react";
import { useEffect } from "react";
import ReactLoading from "react-loading";
import { useNavigate } from "react-router-dom";

const Details = ({ data, name }) => {
  const navigate = useNavigate();

  return (
    <div
    className={`bg-mainbg px-4 mb-2 rounded-lg`}
  >
    <div className="flex justify-start items-center ">
      <div className="text-2xl serif-display "> {name.charAt(0).toUpperCase() + name.slice(1)}</div>
    </div>
    <div
      className={`grid grid-cols-3 grid-rows-${Math.ceil(
        data?.length / 3
      )} rounded-lg gap-1 mt-3 `}
    >
      {data?.length > 0 ? (
        data?.map((book, k) => (
          <div
            key={book?._id}
            className="w-full  pt-[100%] relative cursor-pointer "
            onClick={() => {
              navigate(`/book/${book?._id}`);
            }}
          >
            <img
              src={
                book?.thumbnail ||
                "https://sciendo.com/product-not-found.png"
              }
              alt="aaa"
              className={`w-full h-full absolute top-0 left-0 object-cover rounded-lg `}
            />
          </div>
        ))
      ) : (
        <div className="text-center my-3 text-sm col-span-3 ">
          No item found!
        </div>
      )}
    </div>
  </div>
  );
};

export default Details;
