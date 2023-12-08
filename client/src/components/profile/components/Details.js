import React, {useState} from "react";
import { useEffect } from "react";
import ReactLoading from "react-loading";
import {LoadingIntro, LoadingImage} from "../..";

const Details = ({
    user,
    images,
    navigate,
    own,
    autoFetch,
    dark,
    profileLoading,
    postLoading,
}) => {
    const [editBio, setEditBio] = useState(false);
    const [textBio, setTextBio] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        // console.log(user.about)

       setTextBio(user.about)
    },[user.about])


    const rounded = [
        0,
        2,
        images.length - (images.length % 3 || 3),
        images.length % 3 === 0 ? images.length - 1 : 99999999,
    ];
    const positionRounded = ["tl", "tr", "bl", "br"];

    const updateUser = async () => {
        setLoading(true);
        try {
            await autoFetch.patch(`/api/auth/update-user`, {
                name: user.name,
                about: textBio,
                // username: user.username,
            });
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const handleSubmitBio = () => {
        if (!textBio) {
            setEditBio(false);
        }
        updateUser();
        setEditBio(false);
    };

    const about = () => {
        if (editBio) {
            return (
                <form
                    className='flex items-center flex-col '
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitBio();
                    }}>
                    <textarea
                        type='text'
                        value={textBio}
                        autoFocus
                        className='bg-inherit border-[1px] rounded-lg px-4 py-2 w-[70%] my-3 text-sm'
                        placeholder='Type your bio '
                        onChange={(e) => {
                            setTextBio(e.target.value);
                        }}
                    />
                    <div className='flex gap-x-1.5 '>
                        <button
                            className='bg-[#4E4F50]/20 dark:bg-[#4E4F50]/50 hover:text-white rounded-lg hover:bg-[#4E4F50] transition-50 w-[80px] py-1 '
                            type='submit'>
                            Save
                        </button>
                        <button
                            className=' w-[80px] bg-red-300 hover:text-white dark:bg-red-800 rounded-lg hover:bg-red-600 transition-50 '
                            onClick={() => {
                                setEditBio(false);
                            }}
                            type='reset'>
                            Cancel
                        </button>
                    </div>
                </form>
            );
        }
        return (
            <div
                className={`text-center pt-2 px-[20%]  text-sm flex items-center justify-center gap-x-1 ${
                    loading && "opacity-60"
                } `}>
                {textBio ||
                    user.about ||
                    "No bio "}
                <div className={`${!loading && "hidden"}`}>
                    <ReactLoading
                        type='bubbles'
                        width={25}
                        height={25}
                        color='#6A7583'
                    />
                </div>
            </div>
        );
    };

    const intro = () => {
        if (profileLoading) {
            return <LoadingIntro />;
        }
        return (
            <div
                className={`bg-mainbg p-4 rounded-lg max-h-[30vh] overflow-y-auto scroll-bar ${
                    !dark ? "shadow-post" : ""
                } `}>
                <div className='text-2xl crimson-600 '>
                    Intro
                </div>
                {about()}
                {user._id === own._id && !editBio && (
                    <button
                        className='mt-3 py-2 w-full bg-[#afb1b5]/30 hover:bg-[#afb1b5]/50 dark:bg-[#4E4F50]/50 dark:hover:bg-[#4E4F50] transition-20 rounded-md font-semibold text-sm '
                        onClick={() => {
                            setEditBio(true);
                        }}
                        disabled={loading}>
                        Edit bio
                    </button>
                )}
             
            </div>
        );
    };

    const photo = () => {
        if (postLoading) {
            return <LoadingImage />;
        }
        return (
            <div
                className={`bg-mainbg p-4 max-h-[50vh] rounded-lg overflow-y-auto scroll-bar`}>
                <div className='flex justify-start items-center '>
                    <div className='text-2xl crimson-600 dark:text-[#e4e6eb] '>
                        Item
                    </div>
                </div>
                <div
                    className={`grid grid-cols-3 grid-rows-${
                        Math.ceil((images.length) / 3)
                    } rounded-lg gap-1 mt-3 `}>
                    {images.length > 0 ? (
                        images.map((i, k) => (
                            <div
                                key={i._id}
                                className='w-full  pt-[100%] relative cursor-pointer '
                                onClick={() => {
                                    navigate(`/post/information/${i._id}`);
                                }}>
                                <img
                                    src={i.image?.url || i.book.thumbnail}
                                    alt='aaa'
                                    className={`w-full h-full absolute top-0 left-0 object-cover ${
                                        rounded.includes(k)
                                            ? `rounded-${
                                                  positionRounded[
                                                      rounded.indexOf(k)
                                                  ]
                                              }-lg`
                                            : ""
                                    } `}
                                />
                            </div>
                        ))
                    ) : (
                        <div className='text-center my-3 text-sm col-span-3 '>
                            No item found!
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className='mb-4'>
            {/* Intro */}
            {intro()}
            {/* image */}
            <div className='mt-4'>{photo()}</div>
        </div>
    );
};

export default Details;
