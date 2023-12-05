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
      const { data } = await autoFetch.get(`/api/auth/find-people`);
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
          <div className="flex w-full items-center justify-between crimson-600 text-xl mb-2 ">
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
                  className="text-sky-600 ml-auto text-xs font-semibold "
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
      className={`bg-white ${
        !dark && "shadow-post"
      } max-h-[45vh] flex flex-col items-center overflow-y-auto scroll-bar overflow-x-hidden dark:bg-[#242526] rounded-lg py-4 px-5 w-full mb-4 md:mb-0 `}
    >
      {/* search */}
      {user && (
        <div className="flex items-center border border-black/20 dark:bg-[#4E4F50] dark:text-[#b9bbbe] w-full lg:w-[80%] h-auto md:h-[36px] rounded-lg px-2 ml-2 mb-2">
          {/* <BiSearchAlt className='text-16px md:text-[20px] mx-1 ' /> */}
          <svg
            class="w-5 h-5 mr-1 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            ></path>
          </svg>

          <div
            // @ts-ignore
            ref={searchRef}
          >
            <input
              type="text"
              className="text-sm border-none bg-inherit w-full focus:ring-0 focus:border-0 pl-0 font-medium dark:placeholder:text-[#b1b2b5] dark:text-[#cecfd2] "
              placeholder="Search user"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="scroll-bar absolute max-h-[300px] rounded-[7px] w-[250px] overflow-y-auto overflow-x-hidden top-[60px] translate-x-[-10px] ">
              {(isEmpty || listSearchResult.length > 0) && (
                <div className=" box-shadow">
                  {isEmpty && (
                    <div className="w-full text-center border dark:border-white/20 box-shadow dark:bg-[#2E2F30] rounded-[7px] py-6 ">
                      No user found!
                    </div>
                  )}
                  {listSearchResult.length > 0 && (
                    <ItemsList
                      dataSource={listSearchResult}
                      searchInNav={true}
                      user={user}
                      clearList={clearListResult}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          {loading && (
            <ReactLoading
              type="spinningBubbles"
              width={20}
              height={20}
              color="#7d838c"
            />
          )}
        </div>
      )}

      {content()}
    </div>
  );
};

export default Suggestion;
