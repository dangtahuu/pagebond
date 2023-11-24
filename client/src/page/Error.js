import React from "react";
import {useNavigate} from "react-router-dom";
const Error = () => {
    const navigate = useNavigate();
    return (
        <div
            className='w-screen h-screen flex items-center bg-center justify-center flex-col text-white relative '
            style={{backgroundImage: "url(/images/404.jpg)"}}>
           
            {/* <img src='/images/40.png' alt='err' /> */}
            {/* <div className='mt-20px font-medium  text-[50px] '>OPPS!</div>
            <div className='font-light text-[30px] '>PAGE NOT FOUND</div> */}
            <div className='mt-[15px] mb-[-30%] flex items-center justify-center gap-x-[23px] text-[20px] '>
                <div
                    className='py-[5px] px-[28px] border bg-white text-gray-900 border-white rounded-[5px] cursor-pointer transition-50 '
                    onClick={() => {
                        navigate("/");
                    }}>
                    GO HOME
                </div>
              
            </div>
        </div>
    );
};

export default Error;
