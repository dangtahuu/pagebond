import React, { useState } from "react";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";

// icon
import { FiEdit2 } from "react-icons/fi";
// import { GoPrimitiveDot } from "react-icons/go";
import { TiTick } from "react-icons/ti";

const Header = ({
  user,
  own,
  navigate,
  setMenu,
  menu,
  autoFetch,
  setNameAndToken,
  token,
  tabView
}) => {
  const [loading, setLoading] = useState(false);

  const list = ["Posts", "Following", "Follower", "Shelves", "Diary", "Points"];
  const urlList = ["posts", "following", "follower", "shelves", "diary", "points"];


  const handleFollower = async (user) => {
    setLoading(true);
    try {
      const { data } = await autoFetch.put(`/api/auth/user-follow`, {
        userId: user._id,
      });
      setNameAndToken(data.user, token);
      toast(`Follow ${user.name} success`);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const handleUnFollow = async (user) => {
    setLoading(true);
    try {
      const { data } = await autoFetch.put(`/api/auth/user-unfollow`, {
        userId: user._id,
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      setNameAndToken(data.user, token);
      toast.error(`U have unfollowed ${user.name}!`);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const btn = () => {
    if (loading) {
      return (
        <div className="flex gap-x-1 items-center justify-center font-semibold w-20 h-10 bg-[#D8DADF]/50 dark:bg-[#4E4F50]/50 rounded-md pb-2 ">
          <ReactLoading type="spin" width="20%" height="20%" color="white" />
        </div>
      );
    }
    if (user._id === own._id)
      return (
        <button
          className="flex gap-x-2  items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"
          onClick={() => {
            navigate(`/update-profile`);
          }}
        >
          <FiEdit2 className=" " />
          Edit profile
        </button>
      );
    if (own.following.includes(user._id)) {
      return (
        <div className="flex gap-x-2">

                <button
                          className="flex gap-x-1 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"

          onClick={() => {
              handleUnFollow(user);
          }}
        >
          Unfollow
        </button>
             
             <Link
            to={{
              pathname: "/messenger",
              search: `?data=${encodeURIComponent(JSON.stringify(user))}`,
            }}
          >
            <button
          className="flex gap-x-1 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"

              onClick={() => {
                navigate(`/messenger/${user._id}`);
              }}
            >
             
              Message
            </button>
          </Link>
        </div>
     
      );
    }
    return (
      <div className="flex gap-x-2">
        <button
          className="flex gap-x-1 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"
          onClick={() => handleFollower(user)}
        >
          Follow
        </button>
            <button
          className="flex gap-x-1 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"

              onClick={() => {
                navigate(`/messenger/?data=${encodeURIComponent(JSON.stringify(user))}`);
              }}
            >
             
              Message
            </button>
    
      </div>
    );
  };

  return (
    <div className="pt-[50px] md:pt-[75px] md:px-[15%] w-full bg-mainbg overflow-x-hidden ">
      {/* background image */}
      <img
        src="/images/cover.jpg"
        alt="bg"
        className="w-full h-[30vh] sm:h-[40vh] md:h-[54vh] object-cover rounded-b-lg "
      />
      <div className="flex flex-col sm:flex-row mx-10 sm:items-start gap-x-4 border-b-[1px] dark:border-b-white/10 border-b-black/10 items-center ">
        {/* avatar */}
        <img
          src={user.image.url}
          alt="avatar"
          className="w-[130px] h-[130px] rounded-full object-cover translate-y-[-32px] shrink-0  dark:border-white border-4 border-black/50 "
        />
        <div className="flex flex-col sm:flex-row w-full justify-between items-center sm:items-end pt-4 translate-y-[-32px] sm:translate-y-[0] ">
          <div>
            <div className="flex sm:justify-start justify-center">
              <div className="text-[24px] font-bold md:flex items-center gap-x-1 ">
                <div className="text-center flex items-center">
                  {user.name}
                  {user.role === 1 && (
                    <TiTick className="text-[20px] text-white rounded-full bg-blue-700 ml-2" />
                  )}
                </div>

                {/* <div className='ml-1.5 font-normal text-xl md:text-[28px] flex-shrink-0 '>
                                    ({user.username})
                                </div> */}
              </div>
            </div>
            <div className="dark:text-[#b0b3b8] text-sm font-semibold text-[17px] flex gap-x-1.5 items-center text-[#65676b] justify-center sm:justify-start">
              <span className="cursor-pointer flex-shrink-0 ">
                {user.following.length} following
              </span>
              {/* <GoPrimitiveDot /> */}
              <span className="cursor-pointer flex-shrink-0 ">
                {user.follower.length} follower
              </span>
            </div>
          </div>
          <div className="flex mt-4 sm:mr-[38px] md:mr-0 sm:mt-0 flex-shrink-0 ">
            {btn()}
          </div>
        </div>
      </div>
      <div className="flex mx-0 sm:mx-10 ">
        <ul className="flex items-center justify-between w-full px-16 py-1 gap-x-10 ">
          {list.map((v,index) => (
            <li
              key={v + "button"}
              className={`li-profile ${tabView === urlList[index] && "active"} `}
              onClick={() => {
                // setMenu(v);
                navigate(`/profile/${user._id}?view=${urlList[index]}`);
              }}
            >
              {v}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Header;
