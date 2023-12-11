import { useState } from "react";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAppContext } from "../context/useContext";
import { Navigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";

const Login = () => {
  const { user, setNameAndToken, autoFetch } = useAppContext();
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
      const { password, rememberPassword } = state;
      const email = state.email.toLowerCase();
      const { data } = await autoFetch.post("/api/auth/login", {
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
    setState({ ...state, [e.target.name]: e.target.value });
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
          <div className="mb-4 text-4xl serif-display ">Login</div>
          <form
            className=""
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <div className="">
              <div className="text-xs font-bold md:text-sm mb-1">Email</div>
              <input
                type="email"
                className="input-register"
                placeholder="User@gmail.com"
                name="email"
                onChange={(e) => handleChangeInput(e)}
                disabled={loading}
              />
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold md:text-sm mb-1">Password</div>
              <div className="flex items-center relative">
                <input
                  type={eye ? "text" : "password"}
                  className=" input-register"
                  placeholder="Password"
                  name="password"
                  onChange={(e) => handleChangeInput(e)}
                  disabled={loading}
                />
                {eye ? (
                  <AiOutlineEye
                    className="text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40"
                    onClick={() => setEye(!eye)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="text-black/20 text-[20px] absolute right-2 cursor-pointer h-full dark:text-white/40"
                    onClick={() => setEye(!eye)}
                  />
                )}
              </div>
            </div>
            <div className="mt-2 md:mt-3 text-xs cursor-pointer font-normal flex justify-between items-center ">
              <NavLink to="/forget-password">Forget password</NavLink>
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
                "Login"
              )}
            </button>
          </form>

          <div className="mt-2 md:mt-3 text-sm md:text-base text-center ">
            <span className="block md:inline ">
              Don't have an account?&nbsp;
            </span>
            <NavLink
              to="/register"
              className="font-semibold text-sm md:text-base  "
            >
              Let's register
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

export default Login;
