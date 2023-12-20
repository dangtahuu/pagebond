import { useState, useRef, useEffect } from "react";
import { MdAddPhotoAlternate, MdCancel } from "react-icons/md";
import { useAppContext } from "../../context/useContext";
import ReactLoading from "react-loading";
import { IoClose } from "react-icons/io5";
import Tooltip from "@mui/material/Tooltip";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";

// hocks
import useDebounce from "../../hooks/useDebounce";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { AiOutlineInfoCircle } from "react-icons/ai";

import "@mdxeditor/editor/style.css";
import {
  headingsPlugin, listsPlugin, thematicBreakPlugin,InsertThematicBreak,
  MDXEditor,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  UndoRedo,
  linkDialogPlugin,
  ListsToggle,
  CreateLink
} from "@mdxeditor/editor";

import "./common.css";


const conditionList = ["New", "Like new", "Good", "Worn", "Bad"];

const TradeForm = ({
  input = "",
  setInput = (event) => {},
  setOpenModal = (event) => {},
  attachment = "",
  setAttachment = (event) => {},
  createNewPost = () => {},
  handleEditPost = () => {},
  isEditPost = false,
  // imageEdit = null,
  setFormDataEdit = (event) => {},
  // setImageEdit = (event) => {},
}) => {
  const { autoFetch } = useAppContext();

  const [image, setImage] = useState(input.image);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const api = process.env.REACT_APP_GEOAPIFY_API;

  const textDebounce = useDebounce(input.address, 500);
  const [listSearchResult, setListSearchResult] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tag, setTag] = useState("");

  const hashtagDebounce = useDebounce(tag, 500);
  const [listTagSearch, setListTagSearch] = useState([]);
  const [isSearchingTag, setIsSearchingTag] = useState(false);

  const searchTagRef = useRef();
  const markdownRef = useRef();

  useOnClickOutside(searchTagRef, () => {
    setIsSearchingTag(false);
  });

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

  const handleClickResultTag = (item) => {
    setTag("");
    setInput((prev) => ({ ...prev, hashtag: [...prev.hashtag, item.name] }));
    setListTagSearch([]);
    setIsSearchingTag(false);
  };

  const ResultListTag = () => {
    return (
      <div className="">
        {listTagSearch.map((item) => {
          return (
            <div
              className="py-2 cursor-pointer hover:font-bold"
              key={item._id}
              onClick={() => handleClickResultTag(item)}
            >
              {item.name}
            </div>
          );
        })}
      </div>
    );
  };

  const handleTag = (e) => {
    const words = e.target.value.split(" ");
    if (words.length > 1) {
      if(words[0]!=="") setInput((prev) => ({ ...prev, hashtag: [...prev.hashtag, words[0]] }));
      setTag(words[1]);
    } else {
      setTag(e.target.value);
    }
  };
  const clearListResult = () => {
    if (isSearching) {
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

  // const handleChange = (address) => {
  //   setInput((prev) => ({ ...prev, address }));
  // };

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
  const ResultList = () => {
    return (
      <div className="">
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
              // setImageEdit(null);
              setInput((prev) => ({ ...prev, image: null }));
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
      <div className="mx-auto w-[60%] bg-dialogue rounded-xl px-4 z-[202] box-shadow relative ">
        <IoClose
          className="absolute top-4 right-6 text-lg opacity-50 hover:opacity-100 cursor-pointer transition-50 "
          onClick={() => {
            setOpenModal(false);
          }}
        />
        <div>
          <div className="font-semibold py-3 text-base border-b-[1px] border-altDialogue ">
            {isEditPost ? "Edit trade post" : "Create trade post"}
          </div>

          <label className="form-label block mt-3" for="text">
            Give a description *
          </label>

          <MDXEditor
          ref={markdownRef}
          id="text"
            className="standard-input"
            markdown={input.text}
            placeholder={`Review`}
            onBlur={() => {
              setInput((prev) => ({ ...prev, text: markdownRef.current?.getMarkdown() }));
            }}
            plugins={[listsPlugin(),linkDialogPlugin(),thematicBreakPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    {" "}
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                    <CreateLink />
                    <ListsToggle />
                    <InsertThematicBreak/>
                    {/* <ChangeAdmonitionType/> */}
                  </>
                ),
              }),
              headingsPlugin(),
            ]}
          />

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
                    setInput((prev) => ({ ...prev, condition: e.target.value }))
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
              <div className="scroll-bar -top-[180px] text-xs p-2 absolute bg-altDialogue max-h-[300px] rounded-lg overflow-y-auto overflow-x-hidden">
                {isEmpty && <div className="">No address found!</div>}
                {listSearchResult.length > 0 && <ResultList />}
              </div>
            )}
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
                    <IoClose className="text-xs cursor-pointer bg-mainbg rounded-full absolute -top-[5px] -right-[2px]"
                    onClick={()=>{
                      // let hashtag = input.hashtag
                      // hashtag = hashtag.splice(index, 1)
                      setInput((prev) => {
                         let hashtag = prev.hashtag
                        hashtag.splice(index, 1)
                        return ({ ...prev, hashtag })});
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
                  <ResultListTag />
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
                <AiOutlineInfoCircle
                  className="text-2xl"
                  onClick={() => {
                    console.log(input);
                    console.log(isSearching);
                  }}
                />
              </div>
            </Tooltip>
            <button
              className={`primary-btn w-[100px] block`}
              disabled={
                !input.text ||
                !input.condition ||
                isSearching ||
                !input.address ||
                loading
              }
              onClick={handleButton}
            >
              {isEditPost ? "Save" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;
