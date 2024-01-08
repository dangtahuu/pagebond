import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context/useContext";
import { MdAddPhotoAlternate, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";
import Rating from "@mui/material/Rating";
import { IoIosHelpCircle } from "react-icons/io";
import Tooltip from "@mui/material/Tooltip";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { formatDateYearFirst } from "../../utils/formatDate";
import useDebounce from "../../hooks/useDebounce";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import "@mdxeditor/editor/style.css";
import {
  headingsPlugin,
  listsPlugin,
  thematicBreakPlugin,
  InsertThematicBreak,
  MDXEditor,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  UndoRedo,
  linkDialogPlugin,
  ListsToggle,
  CreateLink,
  linkPlugin,
} from "@mdxeditor/editor";

import "./common.css";
import checkInputPost from "../../utils/checkInputPost";

const ReviewForm = ({
  setOpenModal,
  setPostLoading,
  book,
  posts,
  setPosts,
  current,
  setPost,
  type,
  setStatus,
}) => {
  const { autoFetch, user } = useAppContext();
  const api = process.env.REACT_APP_GEOAPIFY_API;
  const initInput = {
    text: current?.text || "",
    title: current?.detail?.title || "",
    rating: current?.detail?.rating || "",
    content: current?.detail?.content || "",
    development: current?.detail?.development || "",
    pacing: current?.detail?.pacing || "",
    writing: current?.detail?.writing || "",
    insights: current?.detail?.insights || "",
    dateRead: current?.detail?.dateRead? formatDateYearFirst(current?.detail?.dateRead) : "",
    image: current?.image || "",
    address: current?.detail?.address || "",
    location: current?.detail?.location || "",
    condition: current?.detail?.condition || "",
    hashtag: current?.hashtag?.map((one) => one.name) || [],
    spoiler: current?.spoiler || false,
    progress: current?.detail?.progress || "",
  };
  const [input, setInput] = useState(initInput);
  const [image, setImage] = useState(initInput.image);
  const [attachment, setAttachment] = useState(initInput.image);
  const [imageLoading, setImageLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  const pacingList = ["Slow", "Medium", "Fast"];

  const [tag, setTag] = useState("");

  const hashtagDebounce = useDebounce(tag, 500);
  const [listTagSearch, setListTagSearch] = useState([]);
  const [isSearchingTag, setIsSearchingTag] = useState(false);

  const searchTagRef = useRef();
  const tagExceptRef = useRef();

  const markdownRef = useRef();

  const conditionList = ["New", "Like new", "Good", "Worn", "Bad"];

  const searchRef = useRef();

  const textDebounce = useDebounce(input.address, 500);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [listSearchResult, setListSearchResult] = useState([]);
  const clearListResult = () => {
    if (isSearching) {
      setListSearchResult([]);
      setInput((prev) => ({ ...prev, address: "" }));
      setIsEmpty(false);
    }
  };

  useOnClickOutside(searchRef, () => clearListResult());

  useEffect(() => {
    if (textDebounce) {
      searchPlaces();
    }
  }, [textDebounce]);

  const searchPlaces = async () => {
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
    }
  };

  useOnClickOutside(
    searchTagRef,
    () => {
      setIsSearchingTag(false);
    },
    tagExceptRef
  );

  useEffect(() => {
    searchHashtag();
  }, [hashtagDebounce]);

  const searchHashtag = async () => {
    if (!tag) {
      setListTagSearch([]);
      return;
    }
    try {
      const { data } = await autoFetch.get(`/api/hashtag/search?term=${tag}`);
      console.log(data);
      if (data.hashtags.length === 0) {
        setListTagSearch([]);
      } else {
        setListTagSearch(data.hashtags);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickResult = (item) => {
    setTag("");
    setInput((prev) => ({ ...prev, hashtag: [...prev.hashtag, item.name] }));
    setListTagSearch([]);
    setIsSearchingTag(false);
  };

  const ResultList = () => {
    return (
      <div className="" ref={tagExceptRef}>
        {listTagSearch.map((item) => {
          return (
            <div
              className="py-2 cursor-pointer hover:font-bold"
              key={item._id}
              onClick={() => handleClickResult(item)}
            >
              {item.name}
            </div>
          );
        })}
      </div>
    );
  };

  const handleClickResultPlace = (item) => {
    setInput((prev) => ({
      ...prev,
      address: item.properties.formatted,
      location: {
        type: "Point",
        coordinates: [item.properties.lon, item.properties.lat],
      },
    }));
    setListSearchResult([]);
    setIsSearching(false);
  };

  const ResultListPlaces = () => {
    return (
      <div className="">
        {listSearchResult.map((item) => {
          return (
            <div
              className="py-2 cursor-pointer hover:font-bold"
              key={item.properties.place_id}
              onClick={() => handleClickResultPlace(item)}
            >
              {item.properties.formatted}
            </div>
          );
        })}
      </div>
    );
  };

  const handleTag = (e) => {
    const words = e.target.value.split(" ");
    if (words.length > 1) {
      if (words[0] !== "")
        setInput((prev) => ({ ...prev, hashtag: [...prev.hashtag, words[0]] }));
      setTag(words[1]);
    } else {
      setTag(e.target.value);
    }
  };

  const handleImage = async (e) => {
    setImageLoading(true);
    try {
      setImage(null);
      const file = e.target.files[0];
      // @ts-ignore
      setImage({ url: URL.createObjectURL(file) });

      let formData = new FormData();
      formData.append("image", file);

      setFormData(formData);
    } catch (error) {
      console.log(error);
    }
    setImageLoading(false);
  };

  const handleButton = () => {
    const result = checkInputPost(type,input)
    if (!result) return;
    if (current) {
      // Edit post
      updatePost();
    } else {
      // Create post
      // @ts-ignore
      createNewPost();
    }
    setInput({ initInput });
    setOpenModal(false);
    setAttachment("");
    setFormData(null);
  };

  const createNewPost = async () => {
    setPostLoading(true);
    try {
      let image = null;
      if (formData) {
        const { data } = await autoFetch.post(
          `/api/post/upload-image`,
          formData
        );
        image = { url: data.url, public_id: data.public_id };
      }
      console.log(input.dateRead)
      const { data } = await autoFetch.post(`api/${type}/create`, {
        text: input.text,
        book,
        image,
        rating: input.rating,
        content: input.content,
        development: input.development,
        pacing: input.pacing,
        writing: input.writing,
        insights: input.insights,
        dateRead: input.dateRead,
        hashtag: input.hashtag,
        spoiler: input.spoiler,
        location: input.location,
        address: input.address,
        condition: input.condition,
        progress: input.progress,
        title: input.title,
        type: user.role === 1 ? 1 : 0,
      });
      setPosts((prev) => [data.post, ...prev]);
      toast.success("Create successfully!");
      if(type==="review") setStatus((prev)=>({...prev,"to read": false,"up next":false}))
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    } finally {
      setPostLoading(false);
    }
  };

  const updatePost = async () => {
    setPostLoading(true);
    try {
      if (formData) {
        const { data } = await autoFetch.post(
          `/api/post/upload-image`,
          formData
        );
        image = { url: data.url, public_id: data.public_id };
      }
      let postData;

      const { data } = await autoFetch.patch(`api/${type}/${current._id}`, {
        text: input.text,
        image,
        rating: input.rating,
        content: input.content,
        development: input.development,
        pacing: input.pacing,
        writing: input.writing,
        insights: input.insights,
        dateRead: input.dateRead,
        hashtag: input.hashtag,
        spoiler: input.spoiler,
        location: input.location,
        address: input.address,
        condition: input.condition,
        progress: input.progress,
        title: input.title,
      });

      postData = data.post;

      console.log(postData?.detail?.rating);
      // setPost(data.post);
      setPost(postData);

      if (postData.image) {
        setAttachment("photo");
      }
      toast("Update post success!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    } finally {
      setPostLoading(false);
      setFormData(null);
    }
  };

  const uploadImage = () => {
    if (image) {
      return (
        <div className="h-full relative group ">
          <img
            // @ts-ignore
            src={image.url}
            alt="xasdws"
            className="flex items-center rounded-lg justify-center max-h-full "
          />
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 hidden group-hover:flex mb-1 z-[203] cursor-pointer "
            onClick={() => {
              setImage(null);
              setInput((prev) => ({ ...prev, image: null }));
              setFormData(null);
            }}
          />
        </div>
      );
    }
    if (imageLoading) {
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
        <div className="w-full h-full rounded-md flex flex-col items-center justify-center relative bg-inputBg group-hover:bg-[#d9dadc]/60">
          <MdCancel
            className="absolute top-1.5 right-1.5 text-[26px] text-[#8e8f91] hover:text-[#525151] dark:hover:text-[#c0bebe] transition-20 cursor-pointer mb-1 z-[203] "
            onClick={() => {
              setAttachment("");
            }}
          />
          <div>
            <MdAddPhotoAlternate className="w-8 h-8 rounded-full dark:bg-[#5A5C5C] p-1.5 text-black/60 bg-[#D8DADF] " />
          </div>
          <div className="font-semibold text-base leading-5 text-black/60 mt-2 ">
            Add photos
          </div>
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
      <div className="mb-2 relative flex items-center">
        <Tooltip title="aaaa" placement="top-start">
          <div className="flex items-center w-[130px]">
            <label className="form-label">
              {criteria.charAt(0).toUpperCase() + criteria.slice(1) + " *"}
            </label>
            <IoIosHelpCircle className="text-lg ml-2 cursor-pointer" />
          </div>
        </Tooltip>

        <div className="">
          <div className="flex items-center">
            <Rating
              precision={0.5}
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
          if (!current) {
            setOpenModal(false);
          }
        }}
      ></div>
      <div className="mx-auto w-[80%] max-h-[90%] overflow-auto style-3 bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div className="">
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue">
            {current ? `Edit ${type}` :  `Create ${type}`}
          </div>

          {type === "news" && (
            <>
              <label className="form-label mt-3" for="title">
                Give it a title *
              </label>
              <textarea
                id="title"
                value={input.title}
                className={`standard-input`}
                placeholder={`Title`}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, title: e.target.value }));
                }}
              />
            </>
          )}

          {type === "review" && (
            <>
              <div className="mt-3 grid grid-cols-2 ">
                <RatingBox criteria={"content"} />
                <RatingBox criteria={"development"} />
                <RatingBox criteria={"writing"} />
                <RatingBox criteria={"insights"} />
              </div>

              <RatingBox criteria={"rating"} />

              <label className="form-label" for="">
                Pacing *
              </label>

              <div className="grid grid-cols-3 text-xs mt-2">
                {pacingList.map((each) => (
                  <div className="flex items-center">
                    <input
                      className="radio-box"
                      checked={input.pacing === each}
                      type="radio"
                      id={each}
                      value={each}
                      name="pacing"
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          pacing: e.target.value,
                        }))
                      }
                    />
                    <label className="ml-2" for={each}>
                      {each}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          <label className="form-label" for="text">
            Text *
          </label>
          <MDXEditor
            ref={markdownRef}
            id="text"
            className="standard-input h-[200px] markdown prose w-full !max-w-full"
            markdown={input.text}
            placeholder={`What's on your mind?`}
            onBlur={() => {
              setInput((prev) => ({
                ...prev,
                text: markdownRef.current?.getMarkdown(),
              }));
            }}
            plugins={[
              listsPlugin(),
              linkDialogPlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    {" "}
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                    <CreateLink />
                    <ListsToggle />
                    <InsertThematicBreak />
                  </>
                ),
              }),
              headingsPlugin(),
            ]}
          />

          {type === "review" && (
            <>
              <label className="form-label" for="dateRead">
                You read this on
              </label>

              <input
                type="date"
                id="dateRead"
                name="datepicker"
                defaultValue={input.dateRead}
                className={`standard-input mb-2`}
                onBlur={(e) => {
                  setInput((prev) => ({ ...prev, dateRead: e.target.value }));
                }}
              />
            </>
          )}

          {type === "question" && (
            <>
              <label className="form-label mt-3" for="progress">
                Progress
              </label>
              <textarea
                id="progress"
                value={input.progress}
                className={`standard-input`}
                placeholder={`This question is for what page of the book?`}
                onChange={(e) => {
                  setInput((prev) => {
                    const newValue = e.target.value.replace(/[^0-9]/g, "");

                    return { ...prev, progress: newValue };
                  });
                }}
              />
            </>
          )}

          {type === "trade" && (
            <>
              <label className="form-label" for="">
                Condition
              </label>

              <div className="grid grid-cols-5 text-xs mt-2">
                {conditionList.map((each) => (
                  <div className="flex items-center">
                    <input
                      className="radio-box"
                      checked={input.condition == each}
                      type="radio"
                      id={each}
                      value={each}
                      name="condition"
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          condition: e.target.value,
                        }))
                      }
                    />
                    <label className="ml-2" for={each}>
                      {each}
                    </label>
                  </div>
                ))}
              </div>

              <div
                className="mt-2 mb-2 relative"
                // @ts-ignore
                ref={searchRef}
              >
                <label className="form-label" for="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="standard-input relative"
                  placeholder="Search your address"
                  value={input.address}
                  onFocus={() => {
                    setIsSearching(true);
                  }}
                  onChange={(e) => {
                    setInput((prev) => ({ ...prev, address: e.target.value }));
                  }}
                />

                {isSearching && (isEmpty || listSearchResult.length > 0) && (
                  <div className="scroll-bar top-[76px] z-[500] text-xs p-2 absolute bg-altDialogue max-h-[300px] rounded-lg overflow-y-auto overflow-x-hidden">
                    {isEmpty && <div className="">No address found!</div>}
                    {listSearchResult.length > 0 && <ResultListPlaces />}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-3 flex items-center gap-x-3">
            <input
              type="checkbox"
              name=""
              class="checkbox"
              checked={input.spoiler}
              onChange={(e) => {
                setInput({ ...input, spoiler: e.target.checked });
              }}
            />
            <label className="text-xs md:text-sm">
              This contains spoiler of content?
            </label>
          </div>
          <label className="form-label" for="hashtag">
            Hashtag
          </label>
          <div className="standard-input h-[50px] flex items-center mb-2">
            {input.hashtag.length > 0 && (
              <div className="flex items-center gap-x-1 mr-2">
                {input.hashtag.map((one, index) => (
                  <div className="relative text-xs text-mainText inline-block rounded-full bg-dialogue px-2 py-1">
                    {one}
                    <IoClose
                      className="text-xs cursor-pointer bg-mainbg rounded-full absolute -top-[5px] -right-[2px]"
                      onClick={() => {
                        setInput((prev) => {
                          let hashtag = prev.hashtag;
                          hashtag.splice(index, 1);
                          return { ...prev, hashtag };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="relative">
              <input
                className="border-none focus:ring-0 bg-inputBg text-xs md:text-sm px-0"
                placeholder="Type the hashtag"
                value={tag}
                ref={searchTagRef}
                onChange={handleTag}
                onFocus={() => {
                  setIsSearchingTag(true);
                }}
              />

              {isSearchingTag && listTagSearch.length > 0 && (
                <div className="scroll-bar bottom-[50px] text-mainText text-xs p-2 absolute bg-altDialogue max-h-[300px] rounded-lg overflow-y-auto overflow-x-hidden">
                  <ResultList />
                </div>
              )}
            </div>
          </div>

          {attachment && (
            <div className="relative flex w-full h-[100px] rounded-lg group ">
              {uploadImage()}
            </div>
          )}
          {!attachment && (
            <div className="flex items-center cursor-pointer">
              <label className="form-label cursor-pointer" for="">
                Attachment
              </label>

              <MdOutlineAddPhotoAlternate
                className="text-xl ml-2"
                onClick={() => {
                  setAttachment("photo");
                }}
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-2 mb-3">
            <Tooltip
              title="Support the following HTML tags: <strong>, <em>, <b>, <i>, <a>, <blockquote>, <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, <ul>, <ol>, <li>, <p>, <br>"
              placement="top-start"
            >
              <div>
                <AiOutlineInfoCircle className="text-2xl" />
              </div>
            </Tooltip>
            <button
              className={`primary-btn w-[100px] block`}
              disabled={
              
                imageLoading
              }
              onClick={handleButton}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
