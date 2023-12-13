import { TiTick } from "react-icons/ti";
import { toast } from "react-toastify";
import { LoadingSuggestion } from "../..";

import { useRef, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [listPeople, setListPeople] = useState([]);
  useEffect(() => {
    getListPeople();
  }, []);

  const getListPeople = async () => {
    try {
      const { data } = await autoFetch.get(`/api/auth/find-people-to-follow`);
      setListPeople(data.people);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleFollower = async (user) => {
    try {
      const { data } = await autoFetch.put(`/api/auth/user-follow`, {
        userId: user._id,
      });
      setNameAndToken(data.user, token);
      let filtered = listPeople.filter((p) => p._id !== user._id);
      setListPeople(filtered);
      getAllPosts();
      toast(`Follow ${user.name} successfully`);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const Content = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    } else {
      if (listPeople.length) {
        return (
          <>
            {listPeople.map((p) => {
              if (p._id === user._id) {
                return <div key={p._id}></div>;
              }
              return (
                <div className="flex w-full items-center  py-1.5 " key={p._id}>
                  <div
                    className="flex items-center gap-x-1.5 "
                    role="button"
                    onClick={() => {
                      navigate(`profile/${p._id}`);
                    }}
                  >
                    <img
                      src={p.image.url}
                      alt="avatar"
                      className="w-8 h-8 object-cover rounded-full  "
                    />
                    <div>
                      <div className="font-bold text-xs flex items-center gap-x-0.5 ">
                        <span>{p.name}</span>
                        {p.role === 1 && (
                          <TiTick className="text-[17px] text-white rounded-full bg-blue-700 " />
                        )}
                      </div>
                      {/* <div className='text-[12px] text-[#8e8e8e] '>
                                              {
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
    }

    return <div>No result</div>;
  };
  return (
    <div
      className={`max-h-[45vh] flex flex-col items-center overflow-y-auto scroll-bar overflow-x-hidden dark:bg-[#242526] rounded-lg px-5 w-full mb-4 md:mb-0 `}
    >
      <div className="flex w-full items-center justify-between serif-display text-lg mb-2 ">
        People to follow
      </div>

      <Content />
    </div>
  );
};

export default Suggestion;
