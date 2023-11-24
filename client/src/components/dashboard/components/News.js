import { LoadingSuggestion } from "../..";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const News = ({
  autoFetch,
  token,
  dark,
  error,
}) => {
  

  const [adminLoading, setAdminLoading] = useState(false);
  const [listAdmin, setListAdmin] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getListAdmin();
    }
  }, []);

  const getListAdmin = async () => {
    setAdminLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/post/get-adminpost?page=1&perPage=5`
      );
      setListAdmin(data.posts);
      // console.log(data.posts);
    } catch (error) {
      console.log(error);
    }
    setAdminLoading(false);
  };

  const content = () => {
    if (error) {
      return (
        <div className="w-full text-center text-xl font-semibold ">
          <div>No news found!</div>
        </div>
      );
    }
    if (adminLoading) {
      return <LoadingSuggestion />;
    }

    if (listAdmin.length) {
      return (
        <>
          <div className="flex w-full crimson-600 text-xl items-center justify-between ">
            News
          
          </div>
          <div className="">
          {listAdmin.map((a) => {
            return (
              // @ts-ignore

              <div
                className="w-full bg-white cursor-pointer border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-4"
                key={a._id}
                onClick={() => navigate(`/post/information/${a._id}`)}
              >
                <img
                  className="rounded-t-lg max-h-32 w-full object-cover"
                  src={a.image?.url}
                  alt=""
                />

                <div className="p-2">
                  <a href="#">
                    <h5 class="mb-2 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                      {a.title}
                    </h5>
                  </a>
               
                  <a
                    href="#"
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Read
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
      } flex flex-col sticky top-20 overflow-y-auto max-h-[80vh] scroll-bar items-center dark:bg-[#242526] rounded-lg py-4 px-5  w-full mb-4 md:mb-0 `}
    >
      {content()}
    </div>
  );
};

export default News;
