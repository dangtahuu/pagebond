import { useState } from "react";
import { SlArrowDown } from "react-icons/sl";

const FormCreatePost = ({ user, setOpenForm, setOpenSpecial, allowSpecialPost, text }) => {
  const [specialMenu, setSpecialMenu] = useState(false);

  return (
    <div className={`relative px-2 mb-3`}>
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

        {specialMenu && (
          <button
            className={`bg-greenBtn w-[140px] text-white text-sm block absolute top-10 right-1 mr-0 py-1.5 text-center rounded-full font-bold my-3`}
            onClick={() => setOpenSpecial(true)}
          >
            Create special post
          </button>
        )}
        {allowSpecialPost && user.role !== 2 &&  <SlArrowDown
          className="cursor-pointer"
          onClick={() => setSpecialMenu((prev) => !prev)}
        />}
      
      </div>
    </div>
  );
};

export default FormCreatePost;
