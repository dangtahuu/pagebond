import React from "react";
import {MdPhoto} from "react-icons/md";
import {useAppContext} from "../../context/useContext";

const FormCreatePost = ({user, setOpenModal, setAttachment, text}) => {
    const {dark} = useAppContext();
    return (
        <div
            className={` mb-5 pt-3 rounded-lg px-2 md:px-4`}>
            <div className='flex items-center gap-x-2 '>
                <img
                    src={user.image?.url}
                    alt='userImage'
                    className='object-cover w-8 h-8 rounded-full shrink-0 '
                />
                <div
                className=" text-lg serif-display"
                    // className=' dark:bg-[#4E4F50]/70 dark:hover:bg-[#4E4F50] rounded-full px-4 py-[9px] w-[90%] flex justify-start dark:text-[#b0b3b8] font-medium transition-20 h-10 cursor-pointer text-[#65676b] bg-[#E4E6E9]/60 hover:bg-[#E4E6E9]  '
                    // onClick={() => {
                    //     setOpenModal(true);
                    // }}
                    >
                    {/* <div className='mr-2 text-sm overflow-hidden text-overflow-ellipsis'> */}
                        Elliot, what's on your mind?
                    {/* </div> */}
                </div>
                <button
            className={`bg-[#00a11d] w-[100px] text-white text-sm block ml-auto mr-0 py-1.5 text-center rounded-full font-bold my-3`}
            // disabled={!text || loading}
            onClick={() => {
                        setOpenModal(true);
                    }}
            // onClick={handleButton}
          >
            Create post
          </button>
            </div>

            <div
                className={` mt-3 flex items-center justify-between gap-x-2 py-1 text-[15px]  `}>
  
                {/* <button
                    className='flex items-center justify-center w-full gap-x-2 dark:text-[#b0b3b8] text-[#65676b] hover:bg-[#F2F2F2] font-semibold py-2 transition-20 dark:hover:bg-[#4E4F50] rounded-lg text-sm'
                    onClick={() => {
                        setOpenModal(true);
                        setAttachment("image");
                    }}>
                    <MdPhoto className='text-[#45bd62] text-[22px] ' /> Photo
                </button> */}
            </div>
        </div>
    );
};

export default FormCreatePost;
