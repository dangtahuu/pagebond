

import React, {useState} from "react";

import {AiOutlineEye, AiOutlineEyeInvisible} from "react-icons/ai";
import {Nav} from "../components";
import {useAppContext} from "../context/useContext";
import {Navigate, NavLink} from "react-router-dom";
import {toast} from "react-toastify";
import ReactLoading from "react-loading";

const Login = () => {
    const {dark, user, setNameAndToken, autoFetch} = useAppContext();
    const [eye, setEye] = useState(false);
    const [loading, setLoading] = useState(false);
    const initState = {
        email: "",
        password: "",
        rememberPassword: false,
    };

    const [state, setState] = useState(initState);

    const login = async () => {
        setLoading(true);
        try {
            const {password, rememberPassword} = state;
            const email = state.email.toLowerCase();
            const {data} = await autoFetch.post("/api/auth/login", {
                email,
                password,
                rememberPassword,
            });
            setNameAndToken(data.user, data.token);
            toast.success("Login success.");
            setLoading(false);
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.msg || "Something went wrong!");
            setLoading(false);
        }
    };

    const handleChangeInput = (e) => {
        setState({...state, [e.target.name]: e.target.value});
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
                        <div className=' mb-4 text-4xl crimson-600'>Login
                        
                        </div>
                        <form
                            className=''
                            onSubmit={(e) => {
                                e.preventDefault();
                                login();
                            }}>
                            <div className=''>
                                <div className='text-xs font-bold md:text-sm mb-1'>
                                    Email
                                </div>
                                <input
                                    type='email'
                                    className='input-login '
                                    placeholder='User@gmail.com'
                                    name='email'
                                    onChange={(e) => handleChangeInput(e)}
                                    disabled={loading}
                                />
                            </div>
                            <div className='mt-2'> 
                                <div className='text-xs font-bold md:text-sm mb-1'>
                                    Password
                                </div>
                                <div className='flex items-center relative'>
                                    <input
                                        type={eye ? "text" : "password"}
                                        className=' input-login'
                                        placeholder='Password'
                                        name='password'
                                        onChange={(e) => handleChangeInput(e)}
                                        disabled={loading}
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
                            <div className='mt-2 md:mt-3 text-xs cursor-pointer font-normal flex justify-between items-center '>
                                <NavLink to='/forget-password'>
                                    Forget password
                                </NavLink>
                              
                            </div>
                            <button
                                className={`mt-5 w-full font-bold text-sm md:text-base bg-[#F25019] text-white py-[8px] md:py-[13px] rounded-[5px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300${
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
                                    "Sign in"
                                )}
                            </button>
                        </form>
                        
                        <div className='mt-2 md:mt-3 text-sm md:text-base text-center '>
                            <span className='block md:inline '>
                                Don't have an account yet?{" "}
                            </span>
                            <NavLink
                                to={"/register"}
                                role='button'
                                className='hover:scale-110 text-sm md:text-base font-bold '>
                                Register for free
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

export default Login;
