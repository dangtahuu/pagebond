import { useAppContext } from "../../../context/useContext";
import { AiFillCamera } from "react-icons/ai";
import { useState } from "react";
import { toast } from "react-toastify";
import { TiTick } from "react-icons/ti";
import ReactLoading from "react-loading";
import React from "react";

const UpdateProfile = () => {
  const { user, autoFetch, setNameAndToken } = useAppContext();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  const initValueState = {
    name: user.name,
    email: "",
    about: user.about,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const [state, setState] = useState(initValueState);

  const handleImage = async (e) => {
    try {
      setImage(null);
      const file = e.target.files[0];
      // @ts-ignore
      setImage({ url: URL.createObjectURL(file) });

      let formData = new FormData();
      formData.append("image", file);

      // @ts-ignore
      setFormData(formData);
    } catch (error) {
      console.log(error);
    }
  };

  const updateImage = async () => {
    try {
      const { data } = await autoFetch.post(`/api/post/upload-image`, formData);
      return { url: data.url, public_id: data.public_id };
    } catch (error) {
      toast.error("Upload image fail!");
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const {
        newPassword: password,
        confirmNewPassword: rePassword,
        currentPassword,
      } = state;
      const name = state.name || user.name;
      const about = state.about || user.about;
      let image;
      if (formData) {
        image = await updateImage();
        if (!image) {
          setLoading(false);
          setImage(null);
          return;
        }
      }
      const { data } = await autoFetch.patch(`/api/auth/update-user`, {
        name,
        about,
        image,
        password,
        rePassword,
        currentPassword,
      });
      setNameAndToken(data.user, data.token);
      toast(data.msg);
      setState({
        name: data.user.name,
        email: "",
        about: data.user.about,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      if (error?.response?.data?.msg) {
        toast.error(error?.response?.data?.msg);
      } else {
        console.log(error);
      }
    }
    setLoading(false);
  };

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.value });
  };

  return (
    <div className="min-h-screen bg-mainbg pt-[70px] lg:grid lg:grid-cols-3 lg:px-[10%] px-[5%] overflow-x-hidden ">
      <div className="col-span-1 flex flex-col items-center justify-center pb-10 ">
        <label className="relative group w-[120px] h-[120px] cursor-pointer ">
          <img
            // @ts-ignore
            src={image?.url || user.image.url}
            alt="avatar"
            className="w-full h-full rounded-full object-cover "
          />
          <div className="hidden group-hover:flex flex-col items-center w-full h-full justify-center absolute z-10 dark:bg-black/50 bg-white/30 top-0 left-0 rounded-full transition-50 font-bold ">
            <AiFillCamera className="text-4xl text-black/70 " />
          </div>
          <input
            onChange={handleImage}
            type="file"
            accept="image/*"
            name="avatar"
            hidden
          />
        </label>
        <div className="mt-5 text-3xl font-bold text-center flex items-center gap-x-2 ">
          {user.name}{" "}
          {user.role === 1 && (
            <TiTick className="text-[22px] text-white rounded-full bg-greenBtn " />
          )}
        </div>
      </div>
      <div className="col-span-2 my-[5%] lg:py-auto py-7 px-6 bg-dialogue rounded-xl">
        <div className="w-full text-center md:text-3xl text-2xl font-bold lg:my-8 md:my-5 my-4 serif-display ">
          Update profile
        </div>
        <form
          className="md:grid grid-cols-2 md:gap-y-7 gap-x-5 flex flex-col gap-y-5 "
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="">
            <div className={`text-sm md:text-base font-bold mb-2 opacity-70`}>
              Email
            </div>
            <input
              type="email"
              className={`input-register opacity-70 w-full `}
              placeholder="your@email.com"
              name="email"
              value={user.email}
              onChange={(event) => handleChange(event)}
              disabled
            />
          </div>

          <div className="">
            <div className={`text-sm md:text-base font-bold mb-2`}>
              Name
            </div>
            <input
              type="text"
              className={`input-register w-full `}
              placeholder="Your name here"
              name="name"
              value={state.name}
              onChange={(event) => handleChange(event)}
            />
          </div>

          <div className="">
            <div className={`text-sm md:text-base font-bold mb-2`}>
            Current password
            </div>
            <input
              type="password"
              className={`input-register w-full `}
              placeholder="Enter your current password"
              name="currentPassword"
              value={state.currentPassword}
              onChange={(event) => handleChange(event)}
            />
          </div>

          <div className="">
            <div className={`text-sm md:text-base font-bold mb-2`}>
            New password
            </div>
            <input
              type="password"
              className={`input-register w-full `}
              placeholder="Enter your new password"
              name="newPassword"
              value={state.newPassword}
              onChange={(event) => handleChange(event)}
            />
          </div>

          <div className="">
            <div className={`text-sm md:text-base font-bold mb-2`}>
              Confirm new password
            </div>
            <input
              type="password"
              className={`input-register w-full `}
              placeholder="Confirm your new password"
              name="confirmNewPassword"
              value={state.confirmNewPassword}
              onChange={(event) => handleChange(event)}
            />
          </div>

          <div className="">
            <div className={`text-sm md:text-base font-bold mb-2`}>
              Bio
            </div>
            <textarea
              type="text"
              className={`input-register w-full h-[100px]`}
              placeholder="Enter your bio"
              name="about"
              value={state.about}
              onChange={(event) => handleChange(event)}
            />
          </div>
          <div className="col-span-2 flex justify-center items-center  ">
            <button className="w-32 h-10 text-xl primary-btn">
              {loading ? (
                <ReactLoading
                  type="bubbles"
                  width={40}
                  height={40}
                  color="white"
                />
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
