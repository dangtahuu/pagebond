import React, { useMemo, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
// icon
import { toast } from "react-toastify";

import { BsCollectionFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { SiMessenger } from "react-icons/si";
import { MdAdminPanelSettings } from "react-icons/md";
import { BsPersonCircle, BsPersonPlusFill } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { RiSearchFill } from "react-icons/ri";
import { RiFileSearchFill } from "react-icons/ri";

import { BiMessageDetail } from "react-icons/bi";
import { BiHomeAlt2 } from "react-icons/bi";
import { BiSearch } from "react-icons/bi";
import { BiBookContent } from "react-icons/bi";
import { BiFace } from "react-icons/bi";

import {
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineMessage,
  AiOutlineDashboard,
} from "react-icons/ai";
import { IoIosNotificationsOutline } from "react-icons/io";

// components
import { useAppContext } from "../../context/useContext.js";
import { Dropdown } from "../";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_IO_SERVER, {
  reconnection: true,
});

const notiText = {
  1: "has followed you",
  3: "has liked your post",
  5: "has commented on your post",
  7: "has sent you",
  8: "has verified your account",
  9: "has veried your post",
};

const getNotiText = (noti) => {
  switch (noti.type) {
    case 1:
      return `<a className="text-bold">{noti?.fromUser?.name}</a> has followed you`;
      break;
    case 3:
      return `<a className="text-bold">{noti?.fromUser?.name}</a> has liked your post <a className="text-bold">{noti?.linkTo?.text}</a>`;
      break;
    case 5:
      return `<a className="text-bold">{noti?.fromUser?.name}</a> has commented on your post <a className="text-bold">{noti?.linkTo?.text}</a>`;
      break;
    case 7:
      return `<a className="text-bold">{noti?.fromUser?.name}</a> has sent you <a className="text-bold">{noti?.points}</a>`;
      break;
    case 8:
      return `<a className="text-bold">{noti?.fromUser?.name}</a> has verified your account`;
      break;
    case 9:
      return `<a className="text-bold">{noti?.fromUser?.name}</a> has verified your post <a className="text-bold">{noti?.linkTo?.text}</a>`;
      break;
    default:
      return "";
  }
};

const Nav = () => {
  const { user, unreadMessages, autoFetch, setOneState } = useAppContext();
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState(1);
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [unreadNoti, setUnreadNoti] = useState(0);
  const [notiMenu, setNotiMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const getUnreadMessages = async () => {
    try {
      const { data } = await autoFetch.get("api/message/unread");
      setOneState("unreadMessages", data.unread);
    } catch (e) {
      console.log(e);
    }
  };

  const getNotifications = async () => {
    // setNotificationsLoading(true)
    try {

      const { data } = await autoFetch.get("api/log/noti");
      console.log(data.notifications);
      setNotifications(data.notifications);
      // console.log(data.notifications)
      setUnreadNoti(data.unread);
    } catch (e) {
      console.log(e);
    }
    setNotificationsLoading(false)

  };

  // const handleClickNotification = (noti) => {
  //   if(noti.type===)
  // }

  useEffect(() => {
  
    // socket
    if (user) {
      getUnreadMessages();
      getNotifications();
      socket.on("new-message", (newMessage) => {
        const index = newMessage.members.find(
          (value) => value._id === user._id
        );
        if (!index) {
          return;
        }
        // console.log('last message', newMessage.content[newMessage.content.length-1].sentBy)
        if (
          newMessage.content[
            newMessage.content.length - 1
          ].sentBy._id.toString() === user._id
        )
          return;
        getUnreadMessages();
        toast.success("You have a new message");

        // when user open more 2 tabs
      });
    }

    return () => {
      socket.off("new-message");
    };
  }, [user]);

  const menuListLogged = useMemo(() => {
    const list = [
      {
        link: "/",
        icon: <BiHomeAlt2 />,
        className: "dashboard",
      },
      {
        link: "/browse",
        alternative: "/search",
        icon: <BiSearch />,
        className: "search",
      },
      {
        link: "/messenger",
        icon: <BiMessageDetail />,
        className: "messenger",
      },
      {
        link: `/profile/${user._id}`,
        icon: <BiFace />        ,
        className: "profile",
      },

      // {
      //   link: "/browse",
      //   icon: <BsCollectionFill />,
      //   className: "browse",
      // },
    ];
    if (user.role === 1) {
      list.push({
        link: "/admin",
        icon: <BiBookContent />,
        className: "admin",
      });
    }
    return list;
  }, [user.role]);

  const navMenuLogged = () => {
    return menuListLogged.map((v) => (
      <div className={`w-full "px-[10%]"  `} key={"navlink" + v.link}>
        <div
          onClick={() => navigate(`${v.link}`)}
          className={`relative rounded-lg dashboard bg-inherit py-2 md:py-2.5 my-1 mx-1 shrink-1 w-full flex 
                    justify-center text-xl transition-20 
                    before:rounded-lg before:opacity-0 ${
                      (location.pathname === v.link ||
                        location.pathname === v.alternative) &&
                      "active"
                    }`}
          role="button"
        >
          <div className="relative">
            {v.icon}
            {v.className === "messenger" && (
              <div className="bg-greenBtn !text-mainText -top-[7px] -right-[14px] w-[23px] h-[15px] flex justify-center items-center rounded-full h-[10px] w-[20px] text-[10px] absolute">
                {unreadMessages}
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex fixed top-0 w-screen bg-navBar h-12 px-4 sm:px-6 md:px-12 z-[100] items-center py-1 ">
      <div
        className="flex items-center min-w-[33%] "
        style={{ flex: "1 1 auto" }}
      >
        <div className="min-w-[28px]">
          <NavLink to="/" role="button" className="flex items-center">
            <img
              src={`/images/logo.png`}
              alt="logo"
              className=" w-5 md:w-7 h-auto "
            />
            <div className="ml-1">
              <div
                className="hidden min-[1200px]:block text-lg serif-display"
                style={{ lineHeight: "1.25rem" }}
              >
                PAGEBOND
              </div>
            </div>
          </NavLink>
        </div>

        {/* search */}
        {/* {user && <SearchBook />} */}
      </div>
      <ul
        className="hidden md:flex  items-center justify-between text-lg min-w-[33%] "
        style={{ flex: "1 1 auto" }}
      >
        {user ? (
          navMenuLogged()
        ) : (
          <>
            <NavLink
              to="/home"
              className={`relative bg-inherit text-[#2C74B3] py-2 md:py-2.5 my-1 mx-1 shrink-1 w-full flex justify-center hover:text-[#144272] hover:bg-[#EBEDF0] rounded-[10px] text-[23px] transition-20 after:content-[''] after:absolute after:h-[3px] after:w-[70%] after:left-[15%] after:bg-[#0A2647] after:opacity-0 after:bottom-0 -['Home']  before:rounded-lg dark:bg-inherit before:opacity-0 dark:text-[#B8BBBF] dark:hover:bg-[#3A3B3C] dark:hover:text-[#d2d5d7] `}
              role="button"
            >
              <AiFillHome />
            </NavLink>
            <NavLink
              to="/login"
              className={`relative bg-inherit text-[#FDA65D] py-2 md:py-2.5 my-1 mx-1 shrink-1 w-full flex justify-center hover:text-[#FF8243] hover:bg-[#EBEDF0] rounded-[10px] text-[23px] transition-20 after:content-[''] after:absolute after:h-[3px] after:w-[70%] after:left-[15%] after:bg-[#E26A2C] after:opacity-0 after:bottom-0 -['Home']  before:rounded-lg dark:bg-inherit before:opacity-0 dark:text-[#B8BBBF] dark:hover:bg-[#3A3B3C] dark:hover:text-[#d2d5d7] `}
              role="button"
            >
              <BsPersonCircle />
            </NavLink>
            <NavLink
              to="/register"
              className={`relative bg-inherit text-[#62B6B7] py-2 md:py-2.5 my-1 mx-1 shrink-1 w-full flex justify-center hover:text-[#439A97] hover:bg-[#EBEDF0] rounded-[10px] text-[23px] transition-20 after:content-[''] after:absolute after:h-[3px] after:w-[70%] after:left-[15%] after:bg-[#227C70] after:opacity-0 after:bottom-0 -['Home']  before:rounded-lg dark:bg-inherit before:opacity-0 dark:text-[#B8BBBF] dark:hover:bg-[#3A3B3C] dark:hover:text-[#d2d5d7] `}
              role="button"
            >
              <BsPersonPlusFill className="" />
            </NavLink>
          </>
        )}
      </ul>
      <div
        className="flex items-center justify-end min-w-[33%] gap-x-1 sm:gap-x-2 md:gap-x-3 "
        style={{ flex: "1 1 auto" }}
      >
        <div className="flex items-center">
          <div className="relative mr-6">
            <IoIosNotificationsOutline className="cursor-pointer text-xl"  onClick={()=>setNotiMenu(prev=>!prev)}/>
            <div className=" bg-greenBtn -top-[7px] -right-[14px] w-[23px] h-[15px] flex justify-center items-center rounded-full h-[10px] w-[20px] text-[10px] absolute"
          
            >
              {unreadNoti}
             
            </div>
            {notiMenu && <div
                // ref={filterRef}
                className="absolute p-3 rounded-lg right-0 top-[47px] w-[400px] bg-dialogue"
              >
                <div className="text-sm font-bold mb-2">Notifications</div>
                
                {!notificationsLoading && notifications?.map((noti) => (
                  <div className="text-sm flex justify-between items-center border-b-[1px] p-2 border-b-smallText" 
                  // onClick={()=>handleClickNotification(noti)}
                  >
                    <div>
                    <span className="font-semibold">{noti?.fromUser?.name}</span>{" "}
                    {notiText[noti.type]}{" "}
                    <span className="font-semibold">
                      {(noti.type === 3 || noti.type === 5 || noti.type === 9) &&
                        noti?.linkTo?.text}
                    </span>
                    <span className="font-semibold">
                      {(noti.type === 7) &&
                        noti?.points}
                    </span>
                    </div>
                  {!noti.isRead && <div className="rounded-full bg-greenBtn w-[10px] h-[10px]"></div>}
                  </div>
                ))}
              </div>}
          </div>

          {user && (
            // <div className="text-xs md:text-sm border pl-3 md:pr-5 py-[5px] rounded-l-full translate-x-[16px] bg-[#2C74B3] text-white dark:bg-[#3A3A3A] dark:border-white/30 hidden md:flex ">
            <div className="md:pr-3 serif-display text-sm">{user.name}</div>
            // </div>
          )}
          <Dropdown />
        </div>
      </div>
    </div>
  );
};

export default Nav;
