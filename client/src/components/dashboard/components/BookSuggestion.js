import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

const BookSuggestion = ({
  
  autoFetch,
 
  token,

}) => {
 
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
      getList();
  }, []);

  const getList = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/book/get-similar-books-multiple`
      );
      setList(data.books);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const Content = () => {
  if(loading) {
    return <div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>
  }
else {

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
             
                  <p className="mb-1 text-sm cursor-pointer font-semibold"
                  onClick={() => navigate(`/book/${a.suggestedBook._id}`)}
                  
                  >
                    {a.suggestedBook.title}
                  </p>
                  <p className="mb-1 text-xs">
                  {a.suggestedBook.author}
                  </p>
                  
                 
                  <div className="text-xs text-smallText border-t-[1px] border-t-dialogue pt-2">
                    Because you liked <a className="text-mainText font-semibold" href={`a.originalBook._id`}>{a.originalBook.title}</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
    return <div>No result</div>;
  };
  return (
    <div
      className={`hidden md:block sticky top-[60px] rounded-lg mt-2 px-5 w-full mb-4 md:mb-0 `}
    >
         <div className="flex w-full items-center justify-between serif-display text-lg mb-2 ">
              You may like
            </div>
      <Content/>
    </div>
  );
};

export default BookSuggestion;
