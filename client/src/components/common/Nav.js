import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

// icon
import { BsCollectionFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { SiMessenger , } from "react-icons/si";
import { MdAdminPanelSettings} from "react-icons/md";
import { BsPersonCircle, BsPersonPlusFill } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { RiSearchFill } from "react-icons/ri";
import { RiFileSearchFill } from "react-icons/ri";

import { AiOutlineHome , AiOutlineSearch, AiOutlineMessage, AiOutlineDashboard   } from "react-icons/ai";

// components
import { useAppContext } from "../../context/useContext.js";
import { Dropdown} from "../";


const Nav = () => {
  const { user } = useAppContext();

  const menuListLogged = useMemo(() => {
    const list = [
      {
        link: "/",
        icon: <AiOutlineHome />,
        className: "dashboard",
      },
      {
        link: "/search",
        icon: <AiOutlineSearch />        ,
        className: "search",
      },
      {
        link: "/messenger",
        icon: <AiOutlineMessage />,
        className: "messenger",
      },
     
      {
        link: "/browse",
        icon: <BsCollectionFill />,
        className: "browse",
      },
    ];
    if (user.role === 1) {
      list.push({
        link: "/admin",
        icon: <AiOutlineDashboard />        ,
        className: "admin",
      });
    }
    return list;
  }, [user.role]);

  const navMenuLogged = () => {
    return menuListLogged.map((v) => (
      <div className={`w-full "px-[10%]"  `} key={"navlink" + v.link}>
        <NavLink
          to={v.link}
          className={`relative rounded-lg dashboard bg-inherit py-2 md:py-2.5 my-1 mx-1 shrink-1 w-full flex 
                    justify-center text-xl transition-20 
                    before:rounded-lg before:opacity-0`}
          role="button"
        >
          {v.icon}
        </NavLink>
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
