import { useRef, useEffect, useState } from "react";


import ReactLoading from "react-loading";
import { HiMiniHashtag } from "react-icons/hi2";

const Hashtags = ({
  navigate,
  user,
  autoFetch,
  setNameAndToken,
  getAllPosts,
  token,
  dark,
  error,
}) => {
  const [loading, setLoading] = useState(true);
  const [listTags, setListTags] = useState([]);
  useEffect(() => {
    getListTags();
  }, []);

  const getListTags = async () => {
    try {
      const { data } = await autoFetch.get(`/api/hashtag/trending`);
      setListTags(data.hashtags);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const Content = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    } else {
      if (listTags.length) {
        return (
          <>
          <div className="flex w-full items-center justify-between serif-display text-lg mb-2 ">
        Trending
      </div>
          <div>
          {listTags.map((p) => {
              return (
                <div className="flex w-full items-center  py-1.5 " key={p._id}>
                  <div
                    className="flex items-center gap-x-1.5 "
                    role="button"
                    onClick={() => {
                        navigate(
                          `/search/?q=${encodeURIComponent(
                            JSON.stringify(`#${p?.name}`)
                          )}&searchType=post`
                        );
                      }}
                  >
                   <HiMiniHashtag />
                    <div>
                      <div className="font-bold text-xs flex items-center gap-x-0.5 ">
                        <span>{p.name}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className=" ml-auto text-xs font-semibold "
                  >
                    {p.numberOfPosts} posts
                  </div>
                </div>
              );
            })}
          </div>
            
          </>
        );
      }
    }

    return <div></div>;
  };
  return (
    <div
      className={`max-h-[45vh] flex flex-col items-center overflow-y-auto scroll-bar overflow-x-hidden dark:bg-[#242526] rounded-lg px-5 w-full mb-4 md:mb-0 `}
    >
      

      <Content />
    </div>
  );
};

export default Hashtags;
