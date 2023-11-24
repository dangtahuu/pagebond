import React, { useState } from "react";
import Users from "./components/table/Users.components";
import Posts from "./components/table/Posts.components";
// import AdminPost from "./components/AdminPost";
import { useAppContext } from "../../context/useContext";

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

  return (
    <div className="w-screen mb-50 pt-[65px] ">
      <div className="w-full h-full p-8 m-auto md:w-[80%]">
        {/* quantity */}
        <div className=" flex gap-x-5  h-[200px] py-5 justify-center ">
          <div className="w-full h-full rounded-lg bg-sky-600 dark:bg-[#242526] flex flex-col items-center justify-center py-4 sm:py-0 ">
            <div className="text-white text-[24px] font-bold ">Total users</div>
            <div className="text-white text-[60px] leading-[60px] font-extrabold ">
              {totalUser}
            </div>
          </div>
          <div className="w-full h-full rounded-lg bg-[#019267] dark:bg-[#242526] flex flex-col items-center justify-center py-4 sm:py-0 ">
            <div className="text-white text-[24px] font-bold ">Total posts</div>
            <div className="text-white text-[60px] leading-[60px] font-extrabold ">
              {totalPost}
            </div>
          </div>
        </div>
        {/* <div className="m-auto md:w-[65%]">
          <AdminPost
            autoFetch={autoFetch}
            dark={dark}
            setOneState={setOneState}
            token={token}
            user={user}
          />
        </div> */}
        <div className=" ">
          <Users convertDate={convertDate} countUsers={setTotalUser} />
          <Posts convertDate={convertDate} countPosts={setTotalPost} />
        </div>
      </div>
    </div>
  );
};

export default Admin;
