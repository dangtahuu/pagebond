import React, { useState } from "react";
import Users from "./components/table/Users.components";
import Posts from "./components/table/Posts.components";
// import AdminPost from "./components/AdminPost";
import { useAppContext } from "../../context/useContext";
import UserGrid from "./components/UserGrid";
import PostGrid from "./components/PostGrid";
import HeaderMenu from "../common/HeaderMenu";
import SpecialGrid from "./components/SpecialGrid";
const Admin = () => {
  const { autoFetch, user, token, dark, setOneState } = useAppContext();

  const [totalPost, setTotalPost] = useState(0);
  const [totalUser, setTotalUser] = useState(0);

  /**
   * @input string || date. Ex : Sat Jul 16 2022 19:07:55 GMT+0700
   * @return string. Ex: 16-07-2022
   */
  const convertDate = (time) => {
    const date = new Date(time);
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    return `${yyyy}-${mm >= 10 ? mm : "0" + mm}-${dd >= 10 ? dd : "0" + dd}`;
  };

  const [bigMenu,setBigMenu] = useState("Users")
  const bigList = ["Users", "Posts", "Reviews","Trades", "Questions", "Special Posts"]

  const userList = ["All", "Pending","Reported", "Blocked"]
  const postList = ["All","Reported"]
  const specialList = ["All","Pending","Reported"]
  const [menu,setMenu] = useState("All")


  return (
    <div className="w-screen min-h-screen bg-mainbg">
      <div className="w-full p-8 m-auto md:w-[80%]">
        
         <div className="flex mx-0 sm:mx-10 mt-10 mb-10">
           <ul className="flex items-center justify-between w-full px-16 py-1 gap-x-10 ">
             {bigList.map((v) => (
               <li
                 key={v + "button"}
                 className={`li-profile ${bigMenu === v && "active"} `}
                 onClick={() => {
                   setBigMenu(v);
                   setMenu("All")
                   // navigate(`/profile/${user._id}`);
                 }}
               >
                 {v}
               </li>
             ))}
           </ul>
         </div>
        {bigMenu==="Users" && <HeaderMenu list={userList} menu={menu} handler={setMenu}/>}
        {bigMenu==="Special Posts" && <HeaderMenu list={specialList} menu={menu} handler={setMenu}/>}
        {(bigMenu!=="Users"&&bigMenu!=="Special Posts") && <HeaderMenu list={postList} menu={menu} handler={setMenu}/>}

{bigMenu==="Users" && <UserGrid option={menu}/>}
{bigMenu==="Special Posts" && <SpecialGrid option={menu}/>}

{(bigMenu!=="Users"&&bigMenu!=="Special Posts") && <PostGrid option={menu} menu={bigMenu}/>}

      </div>
    </div>
  );
};

export default Admin;
