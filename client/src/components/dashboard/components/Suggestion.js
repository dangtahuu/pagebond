import { TiTick } from "react-icons/ti";
import { toast } from "react-toastify";
import { LoadingSuggestion } from "../..";

import React, { useRef, useEffect, useState } from "react";
import ItemsList from "../../common/ItemsList";

// hocks
import useDebounce from "../../../hooks/useDebounce";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import ReactLoading from "react-loading";

const Suggestion = ({
  navigate,
  user,
  autoFetch,
  setNameAndToken,
  getAllPosts,
  token,
  dark,
  error,
}) => {
  const [text, setText] = useState("");
  const textDebounce = useDebounce(text, 500);
  const [listSearchResult, setListSearchResult] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearListResult = () => {
    setListSearchResult([]);
    setText("");
    setIsEmpty(false);
  };

  const searchRef = useRef();
  useOnClickOutside(searchRef, () => clearListResult());

  useEffect(() => {
    if (textDebounce) {
      searchPeople();
    }
  }, [textDebounce]);

  const searchPeople = async () => {
    setLoading(true);
    if (!text) {
      return;
    }
    try {
      const { data } = await autoFetch.get(`/api/auth/search-user/${text}`);
      if (data.search.length === 0) {
        setIsEmpty(true);
        setListSearchResult([]);
      } else {
        setIsEmpty(false);
        setListSearchResult(data.search);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const [pLoading, setPLoading] = useState(false);
  const [listPeople, setListPeople] = useState([]);
  useEffect(() => {
    if (token) {
      getListPeople();
    }
  }, [token]);

  const getListPeople = async () => {
    setPLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/auth/find-people?number=5`);
      setListPeople(data.people);
    } catch (error) {
      console.log(error);
    }
    setPLoading(false);
  };

  const handleFollower = async (user) => {
    try {
      const { data } = await autoFetch.put(`/api/auth/user-follow`, {
        userId: user._id,
      });
      setNameAndToken(data.user, token);
      // @ts-ignore
      let filtered = listPeople.filter((p) => p._id !== user._id);
      // @ts-ignore
      setListPeople(filtered);
      getAllPosts();
      toast(`Follow ${user.name} success`);
    } catch (error) {
      console.log(error);
    }
  };

  const content = () => {
    if (error) {
      return (
        <div className="w-full text-center text-xl font-semibold ">
          <div>No suggestion found!</div>
        </div>
      );
    }
    if (pLoading) {
      return <LoadingSuggestion />;
    }

    if (listPeople.length) {
      return (
        <>
          <div className="flex w-full items-center justify-between serif-display text-lg mb-2 ">
            Suggestion to you
          </div>
          {listPeople.map((p) => {
            // @ts-ignore
            if (p._id === user._id) {
              // @ts-ignore
              return <div key={p._id}></div>;
            }
            return (
              <div
                className="flex w-full items-center  py-1.5 "
                key={
                  // @ts-ignore
                  p._id
                }
              >
                <div
                  className="flex items-center gap-x-1.5 "
                  role="button"
                  onClick={() => {
                    // @ts-ignore
                    navigate(`profile/${p._id}`);
                  }}
                >
                  <img
                    // @ts-ignore
                    src={p.image.url}
                    alt="avatar"
                    className="w-8 h-8 object-cover rounded-full  "
                  />
                  <div>
                    <div className="font-bold text-xs flex items-center gap-x-0.5 ">
                      <span>
                        {
                          // @ts-ignore
                          p.name
                        }
                      </span>
                      {
                        // @ts-ignore
                        p.role === 1 && (
                          <TiTick className="text-[17px] text-white rounded-full bg-blue-700 " />
                        )
                      }
                    </div>
                    {/* <div className='text-[12px] text-[#8e8e8e] '>
                                            {
                                                // @ts-ignore
                                                p.username
                                            }
                                        </div> */}
                  </div>
                </div>

                <button
                  className="text-greenBtn ml-auto text-xs font-semibold "
                  onClick={() => handleFollower(p)}
                >
                  Follow
                </button>
              </div>
            );
          })}
        </>
      );
    }
    return <></>;
  };
  return (
    <div
      className={`max-h-[45vh] flex flex-col items-center overflow-y-auto scroll-bar overflow-x-hidden dark:bg-[#242526] rounded-lg py-4 px-5 w-full mb-4 md:mb-0 `}
    >
     

      {content()}
    </div>
  );
};

export default Suggestion;
