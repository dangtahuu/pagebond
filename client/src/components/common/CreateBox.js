import { useState } from "react";
import { SlArrowDown } from "react-icons/sl";

const CreateBox = ({ user, setOpenForm, setOpenNews, allowNews, text }) => {
  const [newsMenu, setNewsMenu] = useState(false);

  return (
    <div className={`relative mb-3`}>
      <div className="flex items-center gap-x-2 ">
        <img
          src={user.image?.url}
          alt="userImage"
          className="object-cover w-8 h-8 rounded-full shrink-0 "
        />
        <div className=" text-lg serif-display">
          {user.name}, let's write something
        </div>
        <button
          className={`bg-[#00a11d] w-[140px] relative text-white text-sm block ml-auto mr-0 py-1.5 text-center rounded-full font-bold my-3`}
          onClick={() => {
            setOpenForm(true);
          }}
        >
          Create {text}
        </button>

        {newsMenu && (
          <button
            className={`bg-greenBtn w-[140px] text-white text-sm block absolute top-10 right-1 mr-0 py-1.5 text-center rounded-full font-bold my-3`}
            onClick={() => setOpenNews(true)}
          >
            Create news
          </button>
        )}
        {allowNews && (user.role === 1 || user.role===2) &&  <SlArrowDown
          className="cursor-pointer"
          onClick={() => setNewsMenu((prev) => !prev)}
        />}
      
      </div>
    </div>
  );
};

export default CreateBox;
