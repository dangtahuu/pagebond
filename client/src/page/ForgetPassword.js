import React, {useState} from "react";

import {AiOutlineEye, AiOutlineEyeInvisible} from "react-icons/ai";
import {Nav} from "../components";
import {useAppContext} from "../context/useContext";
import {Navigate, NavLink} from "react-router-dom";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import ReactLoading from "react-loading";

const ForgetPassword = () => {
    const navigate = useNavigate();
    const [eye, setEye] = useState(false);
    const [reEye, setReEye] = useState(false);
    const {dark, user, autoFetch} = useAppContext();

    const [loading, setLoading] = useState(false);
    const initState = {
        newPassword: "",
        rePassword: "",
        email: "",
        secret: "",
    };
    const [state, setState] = useState(initState);

    const handleChangeInput = (e) => {
        setState({...state, [e.target.name]: e.target.value});
    };

    const forgetPassword = async () => {
        setLoading(true);
        try {
            const {email, newPassword, rePassword, secret} = state;
            await autoFetch.post("/api/auth/forgot-password", {
                email,
                newPassword,
                rePassword,
                secret,
            });
            toast.success("Reset password success! Let's login again...");
            setState(initState);
            setLoading(false);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            setLoading(false);
            console.log(error);
            toast.error(error?.response?.data?.msg || "Something went wrong!");
        }
    };

    if (user) {
        return <Navigate to='/' />;
    }
    return (
        <div>
        <Nav />
        {/* <div className='pt-12 bg-[#f0f2f5] dark:bg-[#4E4F50] h-screen w-screen flex items-center relative transition-50 '> */}
            {/* image chicken */}
            <div
            className={`bg-[#f0f2f5] dark:bg-[#4E4F50] h-screen w-screen grid items-center relative transition-50 overflow-hidden md:grid-cols-3 `}
            style={{
                backgroundImage: !dark ? "none" : "url(/images/bg.png)",
            }}>
            {/* image background */}
            <div className='hidden md:flex h-full items-center justify-start relative md:col-span-1 '>
                <img
                    src='/images/cloud.png'
                    alt='cloud'
                    className='absolute bottom-0 left-0 opacity-70 w-full h-full '
                />
                <img
                    src='/images/heart.png'
                    alt='cloud'
                    className='absolute left-[10%] top-[20%] opacity-70 cursor-pointer rotate-90 '
                />
                <img
                    src='/images/heart.png'
                    alt='cloud'
                    className='absolute left-[30%] bottom-[5%] opacity-70 cursor-pointer rotate-[36 deg] '
                />
                <img
                    src='/images/heart.png'
                    alt='cloud'
                    className='absolute left-[10%] opacity-70 cursor-pointer '
                />
                <img
                    src='/images/heart.png'
                    alt='cloud'
                    className='absolute top-[10%] left-[20%] opacity-70 cursor-pointer '
                />
              

                <img
                    src={`/images/ship-space.png`}
                    alt='chicken'
                    className='w-[25%] lg:w-[50%] ml-3 h-auto object-contain z-10'
                />
            </div>
            {/* form */}
            <div className='w-full md:mr-8 md:w-[80%] mx-auto flex items-center justify-center  md:justify-between z-[1] md:mt-4 '>
                    <div className='bg-white fixed top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 shadow-lg dark:bg-[#3a3a3a] dark:text-white/70 w-[90%] md:w-auto p-[20px] rounded-3xl '>
                        <div className=' mb-4 text-4xl crimson-600'>Reset password
                            {/* <div
                                // src={`/images/login.png`}
                                // alt='login'
                                className='h-[40px] w-auto md:h-[50px] '
                            /> */}
                        </div>
                        <form
                            className='md:mt-[20px] '
                            onSubmit={(e) => {
                                e.preventDefault();
                                forgetPassword();
                            }}>
                            <div className='md:flex '>
                                <div className=''>
                                    <div className='text-xs md:text-sm mb-1'>
                                        Email
                                    </div>
                                    <input
                                        disabled={loading}
                                        type='email'
                                        className=' input-login'
                                        placeholder='User@gmail.com'
                                        name='email'
                                        onChange={(e) => handleChangeInput(e)}
                                    />
                                </div>
                            </div>
                            <div className='mt-2'>
                                <div className='text-xs md:text-sm mb-1'>
                                    Answer
                                </div>
                                <input
                                    disabled={loading}
                                    type='text'
                                    className=' input-login '
                                    placeholder='Something...'
                                    name='secret'
                                    onChange={(e) => handleChangeInput(e)}
                                />
                            </div>
                            <div className='mt-2'>
                                <div className='text-xs md:text-sm mb-1'>
                                    New password
                                </div>
                                <div className='flex items-center relative'>
                                    <input
                                        disabled={loading}
                                        type={eye ? "text" : "password"}
                                        className=' input-login '
                                        placeholder='Password'
                                        name='newPassword'
                                        onChange={(e) => handleChangeInput(e)}
                                    />
                                    {eye ? (
                                        <AiOutlineEye
                                            className='text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40'
                                            onClick={() => setEye(!eye)}
                                        />
                                    ) : (
                                        <AiOutlineEyeInvisible
                                            className='text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40'
                                            onClick={() => setEye(!eye)}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className='mt-2'>
                                <div className='text-xs md:text-sm mb-1'>
                                    Confirm new password
                                </div>
                                <div className='flex items-center relative'>
                                    <input
                                        disabled={loading}
                                        type={reEye ? "text" : "password"}
                                        className=' input-login '
                                        placeholder='Password'
                                        name='rePassword'
                                        onChange={(e) => handleChangeInput(e)}
                                    />
                                    {reEye ? (
                                        <AiOutlineEye
                                            className='text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40'
                                            onClick={() => setReEye(!reEye)}
                                        />
                                    ) : (
                                        <AiOutlineEyeInvisible
                                            className='text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40'
                                            onClick={() => setReEye(!reEye)}
                                        />
                                    )}
                                </div>
                            </div>

                            <button
                                className={`mt-5 font-bold w-full text-sm md:text-base bg-[#F25019] text-white py-[8px] md:py-[13px] rounded-[5px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300${
                                    loading ? "loading" : ""
                                } flex items-center justify-center `}
                                type='submit'
                                disabled={loading}>
                                {loading ? (
                                    <ReactLoading
                                        type='bubbles'
                                        width={32}
                                        height={32}
                                        color='white'
                                    />
                                ) : (
                                    "Reset password"
                                )}
                            </button>
                        </form>

                        <div className='mt-3 md:mt-4 text-xs md:text-sm text-center '>
                            <span className='block md:inline '>
                                If you remember password,{" "}
                            </span>
                            <NavLink
                                to='/login'
                                className='font-bold text-xs md:text-sm  '>
                                let's login
                            </NavLink>
                        </div>
                    </div>
                    
                </div>
            <>
                    <div className='fixed bottom-0 right-0'>
                        <img
                            src={`/images/dark-cloud-2.png`}
                            alt='cloud-2'
                            className='object-contain translate-y-2'
                        />
                    </div>
                    <div className='fixed top-0 right-0'>
                        <img
                            src={`/images/dark-cloud-3.png`}
                            alt='cloud-2'
                            className='object-contain translate-y-2 translate-x-5'
                        />
                    </div>
                </>
        </div>
    </div>
    );
};

export default ForgetPassword;
