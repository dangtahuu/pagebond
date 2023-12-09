import { LoadingSuggestion } from "../..";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const News = ({
  autoFetch,
  token,
  error,
  name="",
  url=""
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
       url
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
          <div>No posts found!</div>
        </div>
      );
    }
    if (adminLoading) {
      return <LoadingSuggestion />;
    }

    if (listAdmin.length) {
      return (
        <>
          <div className="flex w-full serif-display text-lg items-center justify-between ">
            {name}
          
          </div>
          <div className="w-full">
          {listAdmin.map((a) => {
            return (
              // @ts-ignore

              <div
                className="w-full bg-dialogue cursor-pointer rounded-lg mt-4"
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
                    <h5 className="mb-2 text-sm font-bold tracking-tight">
                      {a.title}
                    </h5>
                  </a>
               
                  <a
                    href="#"
                    className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium text-center text-white bg-greenBtn "
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
   <>
      {content()}

   </>
  );
};

export default News;
