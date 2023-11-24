import { LoadingSuggestion } from "../..";

import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const NearYou = ({
  
  autoFetch,
 
  token,
  location,
  dark,
  error,

}) => {
 
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getList();
    }
  }, [location]);

  const getList = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/post/get-nearby/${location.longitude}/${location.latitude}/5`
      );
      setList(data.results);
      // console.log(data.posts);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const content = () => {
    if (error) {
      return (
        <div className="w-full text-center text-xl font-semibold ">
          <div>No suggestion found!</div>
        </div>
      );
    }
    if (loading) {
      return <LoadingSuggestion />;
    }

    if (list.length) {
      return (
        <>
          <div className="flex w-full items-center justify-between crimson-600 text-xl mb-2 ">
            Near you
            
          </div>
          <div className="w-full">
            {list.map((a) => {
              return (
                // @ts-ignore

                <div
                  className="flex h-auto flex-col items-center mb-3 bg-white border border-gray-200 rounded-lg shadow md:flex-row w-full hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  key={a._id}
                 
                >
                  <img
                    className="object-cover cursor-pointer w-full rounded-t-lg h-80 md:h-auto md:w-20 md:rounded-none md:rounded-l-lg"
                    src={a.book.thumbnail || "https://sciendo.com/product-not-found.png"}
                    alt=""
                    onClick={() => navigate(`/book/${a.book.code}`)}

                  />
                  <div className="flex flex-col justify-between p-2 leading-normal">
               
                    <p className="mb-1 text-[10px] cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                    onClick={() => navigate(`/book/${a.postedBy._id}`)}
                    
                    >
                      {a.postedBy.name}
                    </p>
                    <p className="mb-1 text-[10px] text-gray-700 dark:text-gray-400">
                      {a.address.slice(0,30)}...
                    </p>
                    
                    <div className="grow-0 cursor-pointer"
                     onClick={() => navigate(`/post/information/${a._id}`)}
                    >
                    <a
                      href="#"
                      className="inline-flex  items-center px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      View
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 ml-2 -mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </a>
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </>
      );
    }
    return <></>;
  };
  return (
    <div
      className={`bg-white ${
        !dark && "shadow-post"
      }  dark:bg-[#242526] hidden md:block sticky top-[84px] max-h-[50vh] overflow-y-auto scroll-bar rounded-lg py-4 px-5 mt-4 w-full mb-4 md:mb-0 `}
    >
      {content()}
    </div>
  );
};

export default NearYou;
