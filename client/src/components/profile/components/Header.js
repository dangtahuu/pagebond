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
  tabView,
  socket
}) => {
  const [loading, setLoading] = useState(false);

  const list = ["Posts", "Following", "Follower", "Shelves", "Diary", "Points"];
  const urlList = [
    "posts",
    "following",
    "follower",
    "shelves",
    "diary",
    "points",
  ];

  const handleFollower = async (user) => {
    setLoading(true);
    try {
      const { data } = await autoFetch.put(`/api/auth/user-follow`, {
        userId: user._id,
      });
      setNameAndToken(data.user, token);
      toast.success(`Follow ${user.name} successfully`);
      socket.emit("new-follower", {newFollower: data.user, receivedId: user._id});
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");

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
      toast.success(`You have unfollowed ${user.name}!`);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");

    }
    setLoading(false);
  };

  const handleReport = async () => {
    try {
      const { data } = await autoFetch.patch(`/api/auth/report`, {
        userId: user._id,
      });
      toast.success("Report successfully! An admin will look into your request soon");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
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
       
            <button
              className="flex gap-x-1 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"
              onClick={() => {
                navigate(`/messenger/?data=${encodeURIComponent(JSON.stringify(user))}`);
              }}
            >
              Message
            </button>

            <button
              className="flex gap-x-1 items-center font-semibold px-3 py-2 bg-[#D8DADF]/50 hover:bg-[#D8DADF] dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md text-sm"
              onClick={()=>{
                if (window.confirm("Are you sure you want to report this user?")) {
                  handleReport()
              }
              }}
            >
              Report
            </button>
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
            navigate(
              `/messenger/?data=${encodeURIComponent(JSON.stringify(user))}`
            );
          }}
        >
          Message
        </button>
      </div>
    );
  };

  return (
    <div className="pt-[50px] md:pt-[75px] w-[80%] max-w-[1500px] bg-mainbg overflow-x-hidden ">
      <div className="flex justify-between items-center">

      <div className="flex flex-col sm:flex-row gap-x-4 items-center ">
        {/* avatar */}
        <img
          src={user.image.url}
          alt="avatar"
          className="w-[110px] h-[110px] rounded-full object-cover shrink-0  border-1 border-black/50 "
        />

        <div className="flex flex-col gap-y-3 w-full">
          <div className="text-center flex items-center">
            <div className="text-3xl font-semibold">{user.name}</div>
            {user.role === 1 && (
              <TiTick className="text-[20px] text-white rounded-full bg-greenBtn ml-2" />
            )}
            <div className="ml-4"> {btn()}</div>
          </div>
          {user.about && (
            <div className="text-sm font-semibold text-[17px] flex gap-x-1.5 items-center text-[#65676b] justify-center sm:justify-start">
              {user.about}
            </div>
          )}
        </div>


      </div>

            <div className="flex items-center justify-center divide-smallText divide-opacity-10 divide-x">
              <div className="flex flex-col items-center pr-2">
                <div className="serif-display text-3xl ">
                  {user.following.length}
                </div>
                <div className="text-smallText text-[10px]">FOLLOWING</div>
              </div>
              <div className="flex flex-col items-center pl-2">
                <div className="serif-display text-3xl">
                  {user.follower.length}
                </div>
                <div className="text-smallText text-[10px]">FOLLOWERS</div>
              </div>
            </div>
      </div>


      <div className="flex mx-0 sm:mx-10 ">
        <ul className="flex items-center justify-between w-full px-16 py-1 gap-x-10 ">
          {list.map((v, index) => (
            <li
              key={v + "button"}
              className={`li-profile ${
                tabView === urlList[index] && "active"
              } `}
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
