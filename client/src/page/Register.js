/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAppContext } from "../context/useContext";
import { Navigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

const Register = () => {
  const navigate = useNavigate();
  const [eye, setEye] = useState(false);
  const [reEye, setReEye] = useState(false);
  const {user, autoFetch } = useAppContext();

  const [loading, setLoading] = useState(false);
  const initState = {
    name: "",
    email: "",
    password: "",
    rePassword: "",
    secret: "",
    official:false,
  };
  const [state, setState] = useState(initState);

  const handleChangeInput = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleChangeCheckBox = (e) => {
    setState({ ...state, [e.target.name]: e.target.checked });
  };

  const register = async () => {
    setLoading(true);
    try {
      const { name, password, rePassword, secret, official } = state;
      if (name.includes("admin")) {
        toast.error(`Name cannot include "admin"`);
        setLoading(false);
        return;
      }
      const email = state.email.toLowerCase();
      const { data } = await autoFetch.post("/api/auth/register", {
        name,
        email,
        password,
        rePassword,
        secret,
        official
      });
      toast.success(data?.msg || "Register success!");
      setState(initState);
      setLoading(false);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.msg || "Something went wrong!");
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }
  return (
      <div
        className={`bg-navBar h-screen w-screen grid items-center relative overflow-hidden md:grid-cols-3 `}
      >
        <div className="hidden md:flex h-full items-center justify-start relative md:col-span-1 ">
          <img
            src="/images/cloud.png"
            alt="cloud"
            className="absolute bottom-0 left-0 opacity-70 w-full h-full"
          />
          <img
            src="/images/heart.png"
            alt="cloud"
            className="absolute left-[10%] top-[20%] opacity-70 rotate-90 "
          />
          <img
            src="/images/heart.png"
            alt="cloud"
            className="absolute left-[30%] bottom-[5%] opacity-70 rotate-[36 deg] "
          />
          <img
            src="/images/heart.png"
            alt="cloud"
            className="absolute left-[10%] opacity-70 "
          />
          <img
            src="/images/heart.png"
            alt="cloud"
            className="absolute top-[10%] left-[20%] opacity-70 "
          />

          <img
            src={`/images/sign-up-girl.png`}
            alt="chicken"
            className="w-[25%] lg:w-[50%] ml-3 h-auto object-contain z-10"
          />
        </div>

        <div className="flex md:col-span-2 w-full items-center justify-center z-10">
          <div className="bg-dialogue w-[90%] fixed top-[50vh] left-[50vw] -translate-x-1/2 mt-4 -translate-y-1/2 lg:w-[40%] 2xl:w-auto  p-[20px] rounded-lg">
            <div className="mb-4 text-4xl serif-display ">Register</div>
            <form
              className=""
              onSubmit={(e) => {
                e.preventDefault();
                register();
              }}
            >
              {/* name and email */}
              <div className="grid grid-cols-2 gap-x-2 md:gap-x-3 ">
                <div className="col-span-1">
                  <div className="text-xs md:text-sm mb-1">Name</div>
                  <input
                    disabled={loading}
                    type="text"
                    className="input-register "
                    placeholder="Your name"
                    value={state.name}

                    name="name"
                    onChange={(e) => handleChangeInput(e)}
                  />
                </div>
                <div className="col-span-1">
                  <div className="text-xs md:text-sm mb-1">Email</div>
                  <input
                    disabled={loading}
                    type="email"
                    className=" input-register"
                    placeholder="User@email.com"
                    name="email"
                    value={state.email}

                    onChange={(e) => handleChangeInput(e)}
                  />
                </div>
              </div>
              {/* password and confirm password */}
              <div className="mt-3 grid grid-cols-2 gap-x-2 md:gap-x-3">
                {/* Password */}
                <div className="col-span-1">
                  <div className="text-xs md:text-sm mb-1">Password</div>
                  <div className="flex items-center relative">
                    <input
                      disabled={loading}
                      type={eye ? "text" : "password"}
                      className=" input-register "
                      placeholder="Password"
                      name="password"
                      value={state.password}

                      onChange={(e) => handleChangeInput(e)}
                    />
                    {eye ? (
                      <AiOutlineEye
                        className="text-[20px] absolute right-2 cursor-pointer h-full"
                        onClick={() => setEye(!eye)}
                      />
                    ) : (
                      <AiOutlineEyeInvisible
                        className="text-[20px] absolute right-2 cursor-pointer h-full"
                        onClick={() => setEye(!eye)}
                      />
                    )}
                  </div>
                </div>
                {/* Confirm password */}
                <div className="col-span-1">
                  <div className="text-xs md:text-sm mb-1">
                    Confirm password
                  </div>
                  <div className="flex items-center relative">
                    <input
                      disabled={loading}
                      type={reEye ? "text" : "password"}
                      className=" input-register "
                      placeholder="Password"
                      name="rePassword"
                      value={state.rePassword}
                      onChange={(e) => handleChangeInput(e)}
                    />
                    {reEye ? (
                      <AiOutlineEye
                        className="text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40"
                        onClick={() => setReEye(!reEye)}
                      />
                    ) : (
                      <AiOutlineEyeInvisible
                        className="text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40"
                        onClick={() => setReEye(!reEye)}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Question and answer */}
              <div className="mt-3 sm:grid grid-cols-2 gap-x-2 md:gap-x-3">
                {/* Question */}
                <div className="col-span-1">
                  <div className="text-xs md:text-sm mb-1">Question</div>
                  <select
                    className="input-register"
                  >
                    <option value="" disabled>
                      Choose an option
                    </option>
                    <option value={1}>First author you knew</option>
                    <option value={2}>First book you knew</option>
                    <option value={3}>First book you bought</option>
                  </select>
                </div>
                {/* Answer */}
                <div className="col-span-1 mt-3 sm:mt-0">
                  <div className="text-xs md:text-sm mb-1">Answer</div>
                  <input
                    disabled={loading}
                    type="text"
                    className=" input-register "
                    placeholder="Something..."
                    name="secret"
                    value={state.secret}

                    onChange={(e) => handleChangeInput(e)}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-x-3">
              <input type="checkbox" name="official" class="checkbox" checked={state.official} onChange={(e)=>handleChangeCheckBox(e)}/>
              <label className="text-xs md:text-sm">I'm an official figure/origanization</label>
              </div>
              <button
                className={`primary-btn  bg-black mt-3 w-full text-sm md:text-base  py-[8px] md:py-[13px]${
                  loading ? "loading" : ""
                } `}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <ReactLoading
                    type="bubbles"
                    width={32}
                    height={32}
                    color="white"
                  />
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <div className="mt-2 md:mt-3 text-sm md:text-base text-center ">
              <span className="block md:inline ">
                Already have an account?&nbsp;
              </span>
              <NavLink
                to="/login"
                className="font-semibold text-sm md:text-base  "
              >
                Let's login
              </NavLink>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 right-0">
          <img
            src={`/images/dark-cloud-2.png`}
            className="object-contain translate-y-2 z-10"
          />
        </div>
        <div className="fixed top-0 right-0">
          <img
            src={`/images/dark-cloud-3.png`}
            className="object-contain translate-y-2 translate-x-5 z-10"
          />
        </div>
      </div>
  );
};

export default Register;
