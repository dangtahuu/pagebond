import React, { useState } from "react";
import { useAppContext } from "../../context/useContext";
import UserGrid from "./components/UserGrid";
import PostGrid from "./components/PostGrid";
import HeaderMenu from "../common/HeaderMenu";
import News from "./components/News";
import Voucher from "./components/Voucher";

const Admin = () => {
  const [bigMenu, setBigMenu] = useState("Users");
  const bigList = [
    "Users",
    "Posts",
    "Reviews",
    "Trades",
    "Questions",
    "News",
    "Vouchers",
  ];

  const userList = ["All", "Pending", "Reported", "Blocked"];
  const postList = ["All", "Reported"];
  const newsList = ["All", "Pending", "Reported"];
  const [menu, setMenu] = useState("All");

  return (
    <div className="w-screen min-h-screen bg-mainbg">
      <div className="w-full p-8 py-16 m-auto md:w-[80%]">
        <div className="serif-display text-4xl my-3">Welcome to Admin Dashboard!</div>
        <div className="flex mx-0 sm:mx-10 mt-10 mb-10">
          <ul className="flex items-center justify-between w-full px-16 py-1 gap-x-10 bg-altDialogue rounded-md shadow-md py-2">
            {bigList.map((v) => (
              <li
                key={v + "button"}
                className={`li-profile ${bigMenu === v && "active"} `}
                onClick={() => {
                  setBigMenu(v);
                  setMenu("All");
                }}
              >
                {v}
              </li>
            ))}
          </ul>
        </div>
        {bigMenu === "Users" && (
          <HeaderMenu list={userList} menu={menu} handler={setMenu} />
        )}
        {bigMenu === "News" && (
          <HeaderMenu list={newsList} menu={menu} handler={setMenu} />
        )}
        {bigMenu !== "Users" && bigMenu !== "News" && bigMenu !== "Vouchers" && (
          <HeaderMenu list={postList} menu={menu} handler={setMenu} />
        )}

        {bigMenu === "Users" && <UserGrid option={menu} />}
        {bigMenu === "News" && <News option={menu} />}
        
        {bigMenu === "Vouchers" && <Voucher />}


        {bigMenu !== "Users" && bigMenu !== "News" && bigMenu !== "Vouchers" && (
          <PostGrid option={menu} menu={bigMenu} />
        )}
      </div>
    </div>
  );
};

export default Admin;
