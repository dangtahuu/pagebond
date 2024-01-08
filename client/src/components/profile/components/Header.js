import React, { useState } from "react";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { Link, useNavigate } from "react-router-dom";

// icon
import { FiEdit2 } from "react-icons/fi";
// import { GoPrimitiveDot } from "react-icons/go";
import { TiTick } from "react-icons/ti";
import GiftForm from "../../common/GiftForm";
import HeaderMenu from "../../common/HeaderMenu";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../../../context/useContext";
import SimpleForm from "../../common/SimpleForm";

const Header = ({ user, own, tabView, currentUserId, numberOfBooks, numberOfPosts }) => {
  const { autoFetch, socket, setNameAndToken, token } = useAppContext();
  const navigate = useNavigate();

  const [openOptions, setOpenOptions] = useState(false);

  const [giftFormOpen, setGiftFormOpen] = useState(false);
  const [points, setPoints] = useState(0);

  const [openReportModal, setOpenReportModal] = useState(false);
  const [reportText, setReportText] = useState("");

  const list = ["Posts", "Saved","Shelves", "Diary", "Points", "Following", "Follower"];
  const urlList = [
    "posts",
    "saved",
    "shelves",
    "diary",
    "points",
    "following",
    "follower",
  ];

  const list2 = ["Posts", "Shelves", "Diary", "Following", "Follower"];
  const urlList2 = ["posts", "shelves", "diary", "following", "follower"];

  if (currentUserId !== own._id && (tabView === "points"||tabView === "saved")) {
    // console.log(user._id)
    // console.log(own._id)
    return <Navigate to="/" />;
  }

  const handleFollow = async (user) => {
    try {
      const { data } = await autoFetch.put(`/api/auth/user-follow`, {
        userId: user._id,
      });
      setNameAndToken(data.user, token);
      toast.success(`Follow ${user.name} successfully`);
      socket.emit("new-follower", {
        newFollower: data.user,
        receivedId: user._id,
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };
  const handleUnfollow = async (user) => {
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
  };

  const handleReport = async () => {
    if (!reportText) return;
    if (!window.confirm("Do you want to report this post?")) {
      return;
    }

    try {
      const { data } = await autoFetch.patch(`/api/auth/report`, {
        userId: user._id,
        text: reportText
      });
      toast.success(
        "Report successfully! An admin will look into your request soon"
      );
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const handleGift = async (points) => {
    try {
      const { data } = await autoFetch.put(`/api/auth/gift-points`, {
        giftedId: user._id,
        points: points,
      });
      toast.success("You have successfully gifted points to this user");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  const Options = () => {
    return (
      <div className="flex gap-x-2 flex-col w-[150px] px-2">
        <button
          className="primary-btn bg-black rounded-lg hover:bg-smallText"
          onClick={() => {
            navigate(
              `/chat/?data=${encodeURIComponent(JSON.stringify(user))}`
            );
          }}
        >
          Message
        </button>

        <button
          className="primary-btn bg-black rounded-lg hover:bg-smallText"
          onClick={() => {
            setGiftFormOpen(true);
          }}
        >
          Gift points
        </button>

        {own.following.includes(user._id) && (
          <button
            className="primary-btn bg-black rounded-lg hover:bg-smallText"
            onClick={() => {
              handleUnfollow(user);
            }}
          >
            Unfollow
          </button>
        )}

        <button
          className="primary-btn bg-black rounded-lg hover:bg-smallText"
          onClick={() => {
          setOpenReportModal(true)
          }}
        >
          Report
        </button>
      </div>
    );
  };

  return (
    <div className="pt-[50px] md:pt-[75px] w-[80%] max-w-[1500px] h-[300px] bg-mainbg overflow-x-hidden ">
      <div className="flex justify-between items-center gap-x-3">
        <div className="flex flex-col sm:flex-row gap-x-4 items-center ">
          {/* avatar */}
          <img
            src={user.image.url}
            alt="avatar"
            className="w-[110px] h-[110px] rounded-full object-cover shrink-0  border-1 border-black/50 "
          />

          <div className="flex flex-col gap-y-3 w-full">
            <div className="text-center flex items-center gap-x-3">
              <div className="text-3xl font-semibold">{user.name}</div>
              {user.role === 1 && (
                <TiTick className="text-[20px] text-white rounded-full bg-greenBtn ml-2" />
              )}
              {user.role === 2 && (
                <TiTick className="text-[20px] text-white rounded-full bg-sky-700 ml-2" />
              )}

              {user._id === own._id && (
                <button
                  className="primary-btn bg-black"
                  onClick={() => {
                    navigate(`/update-profile`);
                  }}
                >
                  <FiEdit2 className=" " />
                  Edit profile
                </button>
              )}

              {!own.following.includes(user._id) && user._id !== own._id && (
                <button
                  className="primary-btn"
                  onClick={() => handleFollow(user)}
                >
                  Follow
                </button>
              )}

              {user._id !== own._id && (
                <div
                  className="ml-auto text-[25px] transition-50 cursor-pointer font-bold w-[35px] h-[35px] rounded-full hover:bg-dialogue flex flex-row items-center justify-center group relative "
                  onClick={() => {
                    setOpenOptions((prev) => !prev);
                  }}
                >
                  <div className="translate-y-[-6px] z-[10]">...</div>

                  {openOptions && (
                    <div className="ml-4 absolute top-[40px] z-[20] bg-black rounded-lg py-2">
                      {" "}
                      <Options />{" "}
                    </div>
                  )}
                </div>
              )}
            </div>
            {user.about && (
              <div className="text-sm font-semibold text-[17px] flex gap-x-1.5 items-center text-[#65676b] justify-center sm:justify-start">
                {user.about}
              </div>
            )}
            {own.follower.includes(user._id) && (
              <div className="text-sm font-semibold text-[17px] flex gap-x-1.5 items-center text-[#65676b] justify-center sm:justify-start">
                Follows you
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center divide-smallText divide-opacity-10 divide-x">
        <div className="flex flex-col items-center pr-2 cursor-pointer min-w-[80px]">
            <div className="serif-display text-3xl ">{numberOfPosts}</div>
            <div className="text-smallText text-[10px]">POSTS</div>
          </div>
          <div className="pl-2 flex flex-col items-center pr-2 cursor-pointer min-w-[80px]">
            <div className="serif-display text-3xl ">{numberOfBooks}</div>
            <div className="text-smallText text-[10px]">BOOKS</div>
          </div>
          <div className="pl-2 flex flex-col items-center pr-2 cursor-pointer min-w-[80px]"
            onClick={() => {
              // setMenu(v);
              navigate(`/profile/${user._id}?view=following`);
            }}>
            <div className="serif-display text-3xl ">
              {user.following.length}
            </div>
            <div className="text-smallText text-[10px]">FOLLOWING</div>
          </div>
          <div className="flex flex-col items-center pl-2 cursor-pointer min-w-[80px]"
            onClick={() => {
              // setMenu(v);
              navigate(`/profile/${user._id}?view=follower`);
            }}>
            <div className="serif-display text-3xl">{user.follower.length}</div>
            <div className="text-smallText text-[10px]">FOLLOWERS</div>
          </div>
        </div>
      </div>

      <div className="flex mx-0 sm:mx-10 mt-6 mb-3 ">
        {user._id === own._id && (
          <ul className="flex items-center py-2 justify-between w-full px-16 py-1 gap-x-10 bg-altDialogue rounded-md shadow">
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
        )}

        {user._id !== own._id && (
          <ul className="flex items-center py-2 justify-between w-full px-16 py-1 gap-x-10 bg-altDialogue rounded-md shadow">
            {list2.map((v, index) => (
              <li
                key={v + "button"}
                className={`li-profile ${
                  tabView === urlList[index] && "active"
                } `}
                onClick={() => {
                  // setMenu(v);
                  navigate(`/profile/${user._id}?view=${urlList2[index]}`);
                }}
              >
                {v}
              </li>
            ))}
          </ul>
        )}
      </div>

      {openReportModal && (
        <SimpleForm
          text={reportText}
          title="Report"
          setOpenModal={setOpenReportModal}
          setText={setReportText}
          submitHandle={handleReport}
          isEditPost={true}
          label="Reason"
          placeholder="Tell us your reason"
        />
      )}

      {giftFormOpen && (
        <GiftForm
          points={points}
          setOpenModal={setGiftFormOpen}
          setPoints={setPoints}
          submitHandle={handleGift}
          isEditPost={true}
        />
      )}
    </div>
  );
};

export default Header;
