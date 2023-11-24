import React, {useState} from "react";
import {AiOutlineEye, AiOutlineEyeInvisible} from "react-icons/ai";
import {Nav} from "../components";
import {useAppContext} from "../context/useContext";
import {Navigate, NavLink} from "react-router-dom";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import ReactLoading from "react-loading";

const Register = () => {
    const navigate = useNavigate();
    const [eye, setEye] = useState(false);
    const [reEye, setReEye] = useState(false);
    const {dark, user, autoFetch} = useAppContext();

    const [loading, setLoading] = useState(false);
    const initState = {
        name: "",
        email: "",
        password: "",
        rePassword: "",
        secret: "",
    };
    const [state, setState] = useState(initState);

    const handleChangeInput = (e) => {
        setState({...state, [e.target.name]: e.target.value});
    };

    const register = async () => {
        setLoading(true);
        try {
            const {name, password, rePassword, secret} = state;
            if (name.includes("admin")) {
                toast.error(`Name cannot include "admin"`);
                setLoading(false);
                return;
            }
            const email = state.email.toLowerCase();
            const {data} = await autoFetch.post("/api/auth/register", {
                name,
                email,
                password,
                rePassword,
                secret,
            });
            toast.success(data?.msg || "Register success!");
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
            <div
                className={`bg-[#f0f2f5] dark:bg-[#4E4F50] h-screen w-screen grid items-center relative transition-50 overflow-hidden md:grid-cols-3 `}
              >
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
                {/* <div className='flex md:col-span-2 w-full items-center justify-center z-10'> */}
                <div className='flex md:col-span-2 w-full items-center justify-center z-10'>
                    <div className='bg-white w-[90%] fixed top-[50vh] left-[50vw] -translate-x-1/2 mt-4 -translate-y-1/2 lg:w-[40%] 2xl:w-auto dark:bg-[#3a3a3a]/80 dark:text-white/70 p-[20px]  rounded-3xl transition-50 '>
                        <div className='  mb-4 text-4xl crimson-600 '>
                            Register
                        </div>
                        <form
                            className=''
                            onSubmit={(e) => {
                                e.preventDefault();
                                register();
                            }}>
                            {/* name and email */}
                            <div className='grid grid-cols-2 gap-x-2 md:gap-x-3 '>
                                <div className='col-span-1'>
                                    <div className='text-xs md:text-sm mb-1'>
                                        Name
                                    </div>
                                    <input
                                        disabled={loading}
                                        type='text'
                                        className='input-register '
                                        placeholder='Your name'
                                        name='name'
                                        onChange={(e) => handleChangeInput(e)}
                                    />
                                </div>
                                <div className='col-span-1'>
                                    <div className='text-xs md:text-sm mb-1'>
                                        Email
                                    </div>
                                    <input
                                        disabled={loading}
                                        type='email'
                                        className=' input-register'
                                        placeholder='User@gmail.com'
                                        name='email'
                                        onChange={(e) => handleChangeInput(e)}
                                    />
                                </div>
                            </div>
                            {/* password and confirm password */}
                            <div className='mt-2 grid grid-cols-2 gap-x-2 md:gap-x-3'>
                                {/* Password */}
                                <div className='col-span-1'>
                                    <div className='text-xs md:text-sm mb-1'>
                                        Password
                                    </div>
                                    <div className='flex items-center relative'>
                                        <input
                                            disabled={loading}
                                            type={eye ? "text" : "password"}
                                            className=' input-register '
                                            placeholder='Password'
                                            name='password'
                                            onChange={(e) =>
                                                handleChangeInput(e)
                                            }
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
                                {/* Confirm password */}
                                <div className='col-span-1'>
                                    <div className='text-xs md:text-sm mb-1'>
                                        Confirm password
                                    </div>
                                    <div className='flex items-center relative'>
                                        <input
                                            disabled={loading}
                                            type={reEye ? "text" : "password"}
                                            className=' input-register '
                                            placeholder='Password'
                                            name='rePassword'
                                            onChange={(e) =>
                                                handleChangeInput(e)
                                            }
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
                            </div>
                            {/* Question and answer */}
                            <div className='mt-2 sm:grid grid-cols-2 gap-x-2 md:gap-x-3'>
                                {/* Question */}
                                <div className='col-span-1'>
                                    <div className='text-xs md:text-sm mb-1'>
                                        Question{" "}
                                       
                                    </div>
                                    <select
                                        className='appearance-none
                                                md:h-[35px]
                                                w-full
                                                h-[30px]
                                                px-3
                                                py-[8px]
                                                text-xs
                                                font-bold
                                                border-2 border-solid border-gray-400
                                                rounded-lg
                                                focus:text-gray-700 focus:bg-white focus:border-[#472899] focus:outline-none
                                                dark:bg-[#242526]
                                                dark:focus:border-white/40
                                                dark:text-white/70
                                                '
                                                placeholder="To reset"
                                        aria-label='Default select example'>
                                            <option value="" disabled>
        Choose an option
      </option>
                                        <option value={1}>
                                            Favorite author
                                        </option>
                                        <option value={2}>
                                            Favorite book
                                        </option>
                                        <option value={3}>
                                            Favorite genre
                                        </option>
                                    </select>
                                </div>
                                {/* Answer */}
                                <div className='col-span-1 '>
                                    <div className='text-xs md:text-sm mb-1'>
                                        Answer
                                    </div>
                                    <input
                                        disabled={loading}
                                        type='text'
                                        className=' input-register '
                                        placeholder='Something...'
                                        name='secret'
                                        onChange={(e) => handleChangeInput(e)}
                                    />
                                </div>
                            </div>
                            <div className='mt-2 md:mt-3 text-xs font-normal flex justify-between items-center '>
                                <NavLink to='/forget-password'>
                                    Forget password?
                                </NavLink>
                            </div>
                            <button
                                className={`mt-5 w-full font-bold text-sm md:text-base  text-white py-[8px] md:py-[13px] rounded-[5px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300${
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
                                    "Register"
                                )}
                            </button>
                        </form>

                        <div className='mt-2 md:mt-3 text-sm md:text-base text-center '>
                            <span className='block md:inline '>
                                Already have an account?&nbsp;
                            </span>
                            <NavLink
                                to='/login'
                                className='font-bold text-sm md:text-base  '>
                                Let's login
                            </NavLink>
                        </div>
                    </div>
                </div>
                {!dark && (
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
                )}
            </div>
        </div>
    );
};

export default Register;
