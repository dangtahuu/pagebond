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
        `/api/book/get-similar-books-multiple`
      );
      setList(data.books);
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
          {/* <div className="flex w-full items-center justify-between crimson-600 text-xl mb-2 ">
            Near you
            
          </div> */}
          <div className="w-full">
            {list.map((a) => {
              return (
                // @ts-ignore

                <div
                  className="flex h-auto flex-col items-center mb-3 md:flex-row w-full"
                  key={a.suggestedBook._id}
                 
                >
                  <img
                    className="object-cover cursor-pointer w-full rounded-t-lg h-80 md:h-auto md:w-20 md:rounded-none md:rounded-l-lg"
                    src={a.suggestedBook.thumbnail || "https://sciendo.com/product-not-found.png"}
                    alt=""
                    onClick={() => navigate(`/book/${a.suggestedBook._id}`)}

                  />
                  <div className="flex flex-col justify-between p-2 leading-normal">
               
                    <p className="mb-1 text-sm cursor-pointer"
                    onClick={() => navigate(`/book/${a.suggestedBook._id}`)}
                    
                    >
                      {a.suggestedBook.title}
                    </p>
                    <p className="mb-1 text-xs">
                    {a.suggestedBook.author}
                    </p>
                    
                   
                    <div className="text-xs text-smallText border-t-[1px] border-t-smallText pt-2">
                      Because you liked <a className="text-mainText" href={`a.originalBook._id`}>{a.originalBook.title}</a>
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
      className={`hidden md:block sticky top-[84px] rounded-lg py-4 px-5 mt-4 w-full mb-4 md:mb-0 `}
    >
      {content()}
    </div>
  );
};

export default NearYou;
