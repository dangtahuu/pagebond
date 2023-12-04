import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/useContext";
import { GiEarthAmerica } from "react-icons/gi";
import {
  MdArrowDropDown,
  MdPhoto,
  MdAddPhotoAlternate,
  MdCancel,
} from "react-icons/md";

import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";
import Rating from "@mui/material/Rating";
import { IoIosHelpCircle } from "react-icons/io";
import Tooltip from "@mui/material/Tooltip";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import PlacesAutocomplete from "react-places-autocomplete";
import {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from "react-places-autocomplete";

import ItemsList from "./ItemsList";

// hocks
import useDebounce from "../../hooks/useDebounce";
import useOnClickOutside from "../../hooks/useOnClickOutside";
// import ResultList from "./ResultList";

const toolTipText = {};

const TradeForm = ({
  input = "",
  setInput = (event) => {},
  setOpenModal = (event) => {},
  attachment = "",
  setAttachment = (event) => {},
  createNewPost = () => {},
  handleEditPost = () => {},
  isEditPost = false,
  imageEdit = null,
  setFormDataEdit = (event) => {},
  setImageEdit = (event) => {},
}) => {
  const { user } = useAppContext();
  const [image, setImage] = useState(imageEdit);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const api = process.env.REACT_APP_GEOAPIFY_API;
  // console.log('aaaa')
  // console.log(api)
  const textDebounce = useDebounce(input.address, 500);
  const [listSearchResult, setListSearchResult] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isSearching, setIsSearching] = useState(false);


  const clearListResult = () => {
    if(isSearching) {
      setListSearchResult([]);
    setInput((prev) => ({ ...prev, address: "" }));
    setIsEmpty(false);
    }
    
  };

  const searchRef = useRef();

  useOnClickOutside(searchRef, () => clearListResult());

  useEffect(() => {
    if (textDebounce) {
      searchPlaces();
    }
  }, [textDebounce]);

  const searchPlaces = async () => {
    setLoading(true);
    if (!input.address) {
      return;
    }
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${input.address}&apiKey=${api}`
      );
      const data = await res.json();
      if (data.features.length === 0) {
        setIsEmpty(true);
        setListSearchResult([]);
      } else {
        setIsEmpty(false);
        setListSearchResult(data.features);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (address) => {
    setInput((prev) => ({ ...prev, address }));
  };

  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => {
        return getLatLng(results[0]);
      })
      .then((latLng) => {
        const location = {
          ...input.location,
          coordinates: Object.values(latLng).reverse(),
        };
        setInput((prev) => ({ ...prev, location, address }));
        // setAddress(address);

        console.log("Success", latLng);
      })
      .catch((error) => console.error("Error", error));
  };

  const handleImage = async (e) => {
    setLoading(true);
    try {
      setImage(null);
      const file = e.target.files[0];
      // @ts-ignore
      setImage({ url: URL.createObjectURL(file) });

      let formData = new FormData();
      formData.append("image", file);

      if (isEditPost) {
        setFormDataEdit(formData);
      } else {
        // @ts-ignore
        setFormData(formData);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleClickResult = (item) => {
    setInput((prev) => ({ ...prev, address: item.properties.formatted, location: {type: "Point", coordinates:[item.properties.lon,item.properties.lat]} }));
    setListSearchResult([]);
    setIsSearching(false)
  };
  const ResultList = () => {
    return (
      <div className="bg-gray-100 text-xs p-2">
        {listSearchResult.map((item) => {
          return (
            <div
            className="py-2 cursor-pointer hover:font-bold"
              key={item.properties.place_id}
              onClick={() => handleClickResult(item)}
            >
              {item.properties.formatted}
            </div>
          );
        })}
      </div>
    );
  };

  const handleButton = () => {
    if (isEditPost) {
      // Edit post
      handleEditPost();
    } else {
      // Create post
      // @ts-ignore
      createNewPost(formData);
    }
    setInput({});
    setOpenModal(false);
    setAttachment("");
    setFormData(null);
  };

  const uploadImage = () => {
    if (image) {
      return (
        <div className="w-full h-full relative group ">
          <img
            // @ts-ignore
            src={image.url}
            alt="xasdws"
            className="flex items-center justify-center w-full max-h-full object-contain "
          />
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 hidden group-hover:flex mb-1 z-[203] cursor-pointer "
            onClick={() => {
              setImage(null);
              setImageEdit(null);
              setFormData(null);
              setFormDataEdit(null);
            }}
          />
        </div>
      );
    }
    if (loading) {
      return (
        <div className="flex items-center justify-center w-full h-full ">
          <ReactLoading
            type="spinningBubbles"
            color="#6A7583"
            height={50}
            width={50}
          />
        </div>
      );
    }
    return (
      <>
        <div className="w-full h-full rounded-md flex flex-col items-center justify-center dark:group-hover:bg-[#47494A] relative bg-[#EAEBED]/60 group-hover:bg-[#d9dadc]/60 dark:bg-inherit ">
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 cursor-pointer mb-1 z-[203] "
            onClick={() => {
              setAttachment("");
            }}
          />
          <div>
            <MdAddPhotoAlternate className="w-10 h-10 rounded-full dark:bg-[#5A5C5C] p-1.5 text-black/60 bg-[#D8DADF] " />
          </div>
          <div className="font-semibold text-[18px] leading-5 text-black/60 dark:text-white/60 ">
            Add photos
          </div>
          <span className="text-[12px] text-[#949698] dark:text-[#b0b3b8] ">
            or drag and drop
          </span>
        </div>
        <input
          type="file"
          accept="image/*"
          className="absolute w-full h-full top-0 left-0 z-[201] cursor-pointer opacity-0 "
          onChange={(e) => handleImage(e)}
        />
      </>
    );
  };

  const RatingBox = ({ criteria }) => {
    return (
      <div className="mb-2 relative">
        <Tooltip title="aaaa" placement="top-start">
          <div
            className="flex items-center"
            //  onMouseLeave={() => setIsHovered(false)}
          >
            <label className=" text-xs font-bold">
              {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
            </label>
            <IoIosHelpCircle className="text-lg ml-2 cursor-pointer" />
          </div>
        </Tooltip>

        <div className="mt-1">
          <div className="flex items-center">
            <Rating
              name="simple-controlled"
              value={input[criteria]}
              onChange={(event, newValue) => {
                setInput((prev) => ({ ...prev, [criteria]: newValue }));
              }}
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          if (!isEditPost) {
            setOpenModal(false);
          }
        }}
      ></div>
      <div className="mx-auto w-[80%] bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div>
          <div className="font-extrabold py-4 text-base border-b-[1px] border-black/20 ">
            {isEditPost ? "Edit post" : "Create Post"}
          </div>

          <label className="text-xs font-bold" for="text">
            Give a description
          </label>

          <textarea
            id="text"
            value={input.text}
            className={`font-bold h-10 mt-1 bg-inherit focus:ring-0 rounded-lg border-gray-300 focus:border-gray-600 w-full placeholder:text-[#a0a0a1] h-[100px] text-xs relative`}
            placeholder={`Write your description`}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, text: e.target.value }));
            }}
          />

          <label className="text-xs font-bold" for="">
            Condition
          </label>
          <div className="grid grid-cols-5 text-xs">
            <div>
              <input checked={input.condition==1} type="radio" id="new" name="condition" value="1" onChange={(e)=>setInput((prev)=>({...prev,condition:e.target.value}))} />
              <label className="ml-2" for="new">
                New
              </label>
            </div>

            <div>
              <input checked={input.condition==2} type="radio" id="like-new" name="condition" value="2" onChange={(e)=>setInput((prev)=>({...prev,condition:e.target.value}))} />
              <label className="ml-2" for="like-new">
                Like New
              </label>
            </div>

            <div>
              <input checked={input.condition==3} type="radio" id="good" name="condition" value="3" onChange={(e)=>setInput((prev)=>({...prev,condition:e.target.value}))}/>
              <label className="ml-2" for="good">
                Good
              </label>
            </div>

            <div>
              <input checked={input.condition==4} type="radio" id="worn" name="condition" value="4" onChange={(e)=>setInput((prev)=>({...prev,condition:e.target.value}))}/>
              <label className="ml-2" for="worn">
                Worn
              </label>
            </div>
            <div>
              <input checked={input.condition==5} type="radio" id="bad" name="condition" value="5" onChange={(e)=>setInput((prev)=>({...prev,condition:e.target.value}))}/>
              <label className="ml-2" for="bad">
                Bad
              </label>
            </div>
          </div>
          <div
          className="mt-2"
            // @ts-ignore
            ref={searchRef}
          >
              <label className="text-xs font-bold" for="address">
            Address
          </label>
            <input
              type="text"
              id="address"
              className="font-bold mt-1 bg-inherit focus:ring-0 rounded-lg border-gray-300 focus:border-gray-600 w-full placeholder:text-[#a0a0a1] text-xs relative "
              placeholder="Enter your address"
              value={input.address}
              onFocus={()=>{setIsSearching(true)}}
              onChange={(e) => {
                setInput((prev) => ({ ...prev, address: e.target.value }));
              }}
            />

            <div className="scroll-bar absolute max-h-[300px] rounded-lg overflow-y-auto overflow-x-hidden">
              { isSearching && (isEmpty || listSearchResult.length > 0) && (
                <div className=" box-shadow">
                  {isEmpty && (
                    <div className="w-full text-center border dark:border-white/20 box-shadow dark:bg-[#2E2F30] rounded-[7px] py-6 ">
                      No user found!
                    </div>
                  )}
                  {listSearchResult.length > 0 && (
                    // <ItemsList
                    //   dataSource={listSearchResult}
                    //   // searchInNav={true}
                    //   user={user}
                    //   clearList={clearListResult}
                    // />
                    <ResultList />
                  )}
                </div>
              )}
            </div>
          </div>

          {attachment && (
            <div className="relative  flex w-full h-[200px] p-2 rounded-md border dark:border-white/20 group ">
              {uploadImage()}
            </div>
          )}
          {!attachment && (
            // <div className="flex items-center justify-between px-4 mt-3 border rounded-md dark:border-white/20 border-black/20 ">
            //   <div className="text-[15px] font-semibold ">Add to your post</div>
            //   <div className="flex  gap-x-4 items-center  py-2  ">
            //     <div
            //       className="w-[35px] h-[35px]  rounded-full flex items-center justify-center dark:hover:bg-[#3A3B3C] px-1.5 cursor-pointer hover:bg-black/10 transition-20 "
            //       onClick={() => {
            //         setAttachment("photo");
            //       }}
            //     >
            //       <MdPhoto className={`relative text-[#45bd62] text-[26px] `} />
            //     </div>
            //   </div>
            // </div>
            <div className="flex mt-2 items-center cursor-pointer">
              <label className="text-xs font-bold cursor-pointer" for="">
                Add attachment
              </label>

              <MdOutlineAddPhotoAlternate
                className="text-xl ml-2"
                onClick={() => {
                  setAttachment("photo");
                }}
              />
            </div>
          )}

          <button
            className={`bg-black w-[100px] text-white text-sm block ml-auto mr-0 py-1.5 text-center rounded-full font-bold my-3`}
            disabled={!input.text || loading}
            onClick={handleButton}
            // ref={searchRef}
          >
            {isEditPost ? "Save" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;
