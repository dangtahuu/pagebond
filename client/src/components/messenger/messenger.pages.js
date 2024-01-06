import React, { useEffect, useRef, useReducer, useState } from "react";
import { AiOutlineCamera, AiOutlineSend } from "react-icons/ai";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";

import { useNavigate, useLocation } from "react-router-dom";
//components
import { useAppContext } from "../../context/useContext";
import Left from "./components/Left";
import MainChat from "./components/MainChat.";
import { PiBroom } from "react-icons/pi";

import "./messenger.css";
import { MdCancel } from "react-icons/md";
import prompts from "../../consts/prompts";
import shuffle from "../../utils/shuffle";
import { HiLightBulb } from "react-icons/hi2";
import useOnClickOutside from "../../hooks/useOnClickOutside";

const AI_ID = process.env.REACT_APP_AI_ID;

const CHANGE_ALL_MESSAGES = "CHANGE_ALL_MESSAGES";
const GET_DATA_SUCCESS = "GET_DATA_SUCCESS";
const SET_LOADING = "SET_LOADING";
const SET_AI_LOADING = "SET_AI_LOADING";

const SET_ONE_STATE = "SET_ONE_STATE";
const HANDLE_SEND_MESSAGE = "HANDLE_SEND_MESSAGE";
const HANDLE_DELETE_MESSAGE = "HANDLE_DELETE_MESSAGE";

const CLICK_TO_BOX_MESSAGE = "CLICK_TO_BOX_MESSAGE";
const EXIT_NEW_MESSAGE = "EXIT_NEW_MESSAGE"

const reducer = (state, action) => {
  switch (action.type) {
    case CHANGE_ALL_MESSAGES: {
      return {
        ...state,
        allConversations: action.payload.data,
      };
    }
    case GET_DATA_SUCCESS: {
      return {
        ...state,
        allConversations: action.payload.allConversations,
        receivedUser: action.payload.receivedUser,
        isNewMessage: action.payload.isNewMessage,
        index: action.payload.index,
        text: action.payload.text,
      };
    }

    case SET_LOADING: {
      return {
        ...state,
        loading: action.payload.data,
      };
    }
    case SET_AI_LOADING: {
      return {
        ...state,
        AILoading: action.payload.data,
      };
    }
    case SET_ONE_STATE: {
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    }
    case HANDLE_SEND_MESSAGE: {
      return {
        ...state,
        allConversations: action.payload.allConversations,
        index: action.payload.index,
        text: "",
        isNewMessage: false,
        suggestedRes: action.payload.suggestedRes || [],
        fullRes: action.payload.fullRes || null,
        context: action.payload.context || true,
      };
    }
    case HANDLE_DELETE_MESSAGE: {
      return {
        ...state,
        allConversations: action.payload.allConversations,
      };
    }
    case CLICK_TO_BOX_MESSAGE: {
      return {
        ...state,

        index: action.payload.index,
        isNewMessage: false,
      };
    }
    case EXIT_NEW_MESSAGE: {
      return {
        ...state,
        receivedUser: action.payload.receivedUser,
        index: action.payload.index,
        isNewMessage: false,
      };
    }

    default: {
      throw new Error("Invalid action");
    }
  }
};

const initImage = { url: "", public_id: "" };

const Message = () => {
  const { user, unreadMessages, autoFetch, setOneState, socket } =
    useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dataString = queryParams.get("data");
  const newMessageData = JSON.parse(decodeURIComponent(dataString));

  const [promptOpen, setPromptOpen] = useState(false);

  const initState = {
    receivedUser: [],
    allConversations: [], // all message
    index: "", /// _id of that message is showing
    text: "", /// text in input send new message
    loading: false, // loading
    AILoading: false,
    isNewMessage: false, // Mode new message
    suggestedRes: [],
    context: true,
    fullRes: null,
  };

  const [state, dispatch] = useReducer(reducer, initState);
  const [scrLoading, setScrLoading] = useState(false);

  useEffect(() => {
   console.log(state)
  }, [state]);

  useEffect(() => {
    if (state.index) markasRead();
  }, [state.index]);

  const promptRef = useRef();
  const exceptRef = useRef();

  const messagesEndRef = useRef();
  const emailInputRef = useRef();

  useOnClickOutside(
    promptRef,
    () => {
      setPromptOpen(false);
    },
    exceptRef
  );

  const markasRead = async () => {
    try {
      const { data } = await autoFetch.patch(
        `/api/chat/mark-read/${state.index}`
      );
      const { data: unreadData } = await autoFetch.get(`/api/chat/unread`);
      setOneState("unreadMessages", unreadData.unread);
    } catch (e) {
      console.log(e);
    }
  };

  const [image, setImage] = useState(initImage);
  const [formData, setFormData] = useState(null);

  const setLoading = (value) => {
    dispatch({
      type: SET_LOADING,
      payload: {
        data: value,
      },
    });
  };

  const setAILoading = (value) => {
    dispatch({
      type: SET_AI_LOADING,
      payload: {
        data: value,
      },
    });
  };

  const setPageState = (name, value) => {
    dispatch({
      type: SET_ONE_STATE,
      payload: {
        name,
        value,
      },
    });
  };

  

  useEffect(() => {
    let change = false;
    if (state.allConversations) {
      // socket
      if (user) {
        socket.on("new-message", (newMessage) => {
          const index = newMessage.members.find(
            (value) => value._id === user._id
          );
          if (!index) {
            return;
          }
          let newData = state.allConversations.filter((d) => {
            if (d._id === newMessage._id) {
              d.content = newMessage.content;
              d.updatedAt = newMessage.updatedAt;
              change = true;
            }
            return d;
          });
          if (document.visibilityState === "visible") markasRead();
          
          dispatch({
            type: CHANGE_ALL_MESSAGES,
            payload: {
              data: change ? newData : [newMessage, ...state.allConversations],
            },
          });

          change = false;
        });
      }
      if (!state.text && !state.textSearchPeople) {
        emailInputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    return () => {
      socket.off("new-message");
    };
  }, [state]);

  const getData = async () => {
    setScrLoading(true);
    let receiverData;
    try {
      const { data } = await autoFetch.get("api/chat/all");

      let isNewData = true;
      let indexOfNewData;

      if (newMessageData) {
        receiverData = {
          name: newMessageData.name,
          _id: newMessageData._id,
          image: { url: newMessageData.image.url },
          text: newMessageData.text || "",
        }; 

      }

      if (data.conversations.length > 0) {
        if (user) {
          var us = data.conversations[0].members.filter((m) => m._id !== user._id);
        }
      }

      dispatch({
        type: GET_DATA_SUCCESS,
        payload: {
          allConversations: data.conversations,
          receivedUser: receiverData ? [receiverData] : [us[0]],
          isNewMessage: receiverData ? true : false,
          index: data.conversations[0]._id,
          text: receiverData?.text ? receiverData.text : "",
        },
      });
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.msg) {
        toast.error(error.response.data.msg);
      }
    }
    setScrLoading(false);
  
  };

  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user]);

  const navigateToProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  // upload image to cloudinary
  const handleUpImageToCloud = async () => {
    try {
      const { data } = await autoFetch.post(`/api/post/upload-image`, formData);
      return { url: data.url, public_id: data.public_id };
    } catch (error) {
      toast.error("Upload image fail!");
      return initImage;
    }
  };

  const handleDeleteMess = async (messageId, contentId) => {
    // console.log('bbbbb')
    // console.log(receivedId)
    // setLoading(true);
    try {
      const { data } = await autoFetch.patch("/api/chat/delete-message", {
        messageId,
        contentId,
      });
      // }

      //   let id = "";
      let newSourceData = state.allConversations.map((each) => {
        if (each._id === data.conversation._id) {
          return data.conversation;
        }
        return each;
      });

      newSourceData = newSourceData.filter((each) => each.content.length !== 0);

      //   let mainData;
      //   mainData = id ? newSourceData : [dt.data.conversation, ...state.allConversations];

      dispatch({
        type: HANDLE_DELETE_MESSAGE,
        payload: {
          allConversations: newSourceData,
          index: data.conversation.content.length !== 0 ? data.conversation._id : "0",
        },
      });
      //   setImage(initImage);

      //   if (!dt.data.ai_res) socket.emit("new-message", dt.data.conversation);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.msg) {
        toast.error(error.response.data.msg);
      }
    }
    // setLoading(false);
  };

  const handleSendMess = async (received, text) => {
    setLoading(true);
    try {
      let imageUrl = image;
      if (imageUrl.url) {
        imageUrl = await handleUpImageToCloud();
        if (!imageUrl.url) {
          setLoading(true);
          setImage(initImage);
          return;
        }
      }
      const { data } = await autoFetch.put("/api/chat/send-message", {
        text,
        receivedId: received,
        image: imageUrl,
      });

      let id;

      let newSourceData = state.allConversations.filter((one) => {
        if (one._id === data.conversation._id) {
          id = one._id;
          one.content = data.conversation.content;
        }
        return one;
      });

      let mainData;

      //new conversation or not
      mainData = id ? newSourceData : [data.conversation, ...state.allConversations];

      if(state.isNewMessage) {
        navigate('/messenger')
      }

      dispatch({
        type: HANDLE_SEND_MESSAGE,
        payload: {
          allConversations: mainData,
          index: data.conversation._id,
        },
      });

     
      setImage(initImage);

      socket.emit("new-message", data.conversation);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.msg) {
        toast.error(error.response.data.msg);
      }
    }
    setLoading(false);
    if (AI_ID === received[0]._id) {
      handleAIRes(text);
    }
  };

  const handleAIRes = async (text) => {
    setAILoading(true);
    try {
      let reqData;
      if (state.fullRes && state.context) {
        reqData = {
          text,
          prev: state.fullRes,
        };
      } else reqData = { text };

      const { data } = await autoFetch.put("/api/chat/get-ai-res", reqData);
      
      let id = "";
      let newSourceData = state.allConversations.filter((d) => {
        if (d._id === data.conversation._id) {
          id = d._id;
          d.content = data.conversation.content;
        }
        return d;
      });

      let mainData;
      mainData = id ? newSourceData : [data.conversation, ...state.allConversations];

      dispatch({
        type: HANDLE_SEND_MESSAGE,
        payload: {
          allConversations: mainData,
          index: data.conversation._id,
          suggestedRes: data.suggestedRes,
          fullRes: data.fullRes,
          context: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
    setAILoading(false);
    setPromptOpen(true);
  };

  // set image to show in form
  const handleImage = (e) => {
    setImage(initImage);
    const file = e.target.files[0];
    // @ts-ignore
    setImage({ url: URL.createObjectURL(file) });

    let formData = new FormData();
    formData.append("image", file);

    // @ts-ignore
    setFormData(formData);
  };

  const PromptSection = ({ data }) => {
    if (data.length === 0) {
      let shuffled = shuffle(prompts);
      data = shuffled.slice(0, 5);
    }

    return (
      <div
        className={`flex flex-col items-center py-4 bg-navBar justify-center rounded-lg w-[450px]  mb-5 gap-y-2
      `}
      >
        {data.map((one) => (
          <div
            className="w-[400px] text-sm py-2 px-4 rounded-lg border-[1px] border-dialogue cursor-pointer"
            onClick={() => {
              setPageState("text", one);
              setPromptOpen(false);
            }}
          >
            <div>{one}</div>
          </div>
        ))}
      </div>
    );
  };

  if (scrLoading) {
    return (
      <div className="w-screen bg-mainbg h-screen px-2 md:px-[5%] pt-[40px] md:pt-[70px] overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen bg-mainbg h-screen px-2 md:px-[5%] pt-[40px] md:pt-[70px] overflow-hidden">
      <div className="w-full h-full grid grid-cols-4 ">
        <div className="col-span-1 ">
          <Left
            dispatch={dispatch}
            getData={getData}
            setPageState={setPageState}
            state={state}
          />
        </div>
        <div className="col-span-3 ">
          <MainChat
            dispatch={dispatch}
            messagesEndRef={messagesEndRef}
            // searchPeopleToNewMessage={searchPeopleToNewMessage}
            setPageState={setPageState}
            state={state}
            user={user}
            handleDeleteMess={handleDeleteMess}
            navigateToProfile={navigateToProfile}
            AI_ID={AI_ID}
          />

          {/* form add new message */}
          {!state.allConversations.length && !state.isNewMessage ? (
            <></>
          ) : (
            <form
              className="flex-grow-0 py-3 px-4"
              onSubmit={(e) => {
                e.preventDefault();

                handleSendMess(state.receivedUser, state.text);
              }}
            >
              <div className="w-full rounded-full flex gap-x-2 items-center relative ">
                {image?.url && (
                  <div className="absolute w-[200px] h-[100px] md:w-[400px] md:h-[200px] rounded-md dark:bg-[#18191A] border dark:border-white/50 top-[-120px] md:top-[-220px] right-[60px] z-[20] flex items-center justify-center bg-[#8EABB4] border-[#333]/70 ">
                    {state.loading && (
                      <div className="absolute z-[21] bg-black/50 w-full h-full flex items-center justify-center ">
                        <ReactLoading
                          type="spin"
                          width={40}
                          height={40}
                          color="#7d838c"
                        />
                      </div>
                    )}
                    <img
                      src={image?.url}
                      alt="attachment"
                      className="h-full w-auto object-contain "
                    />
                    {!state.loading && (
                      <MdCancel
                        className="absolute text-2xl cursor-pointer top-1 right-1 transition-50 group-hover:flex opacity-50 hover:opacity-100 text-white  "
                        onClick={() => {
                          setImage(initImage);
                        }}
                      />
                    )}
                  </div>
                )}
                {state.receivedUser._id === AI_ID && (
                  <PiBroom
                    className="shrink-0 text-xl transition-50 opacity-60 hover:opacity-100 cursor-pointer "
                    onClick={() => {
                      setPageState("context", false);
                      toast.success("Context cleared!");
                    }}
                  />
                )}
                <input
                  type="text"
                  className="w-full bg-inherit first-line:focus:ring-0 focus:ring-white rounded-full border-[1px] border-[#8EABB4] flex px-4 items-center "
                  placeholder="Type your message"
                  value={state.text}
                  onChange={(e) => setPageState("text", e.target.value)}
                  disabled={!state.receivedUser || state.loading}
                  ref={emailInputRef}
                />
                {state.receivedUser._id !== AI_ID && (
                  <label>
                    <AiOutlineCamera className="shrink-0 text-xl transition-50 opacity-60 hover:opacity-100 dark:text-[#b0b3b8] cursor-pointer " />
                    <input
                      onChange={handleImage}
                      type="file"
                      accept="image/*"
                      name="avatar"
                      hidden
                    />
                  </label>
                )}

                {state.receivedUser._id === AI_ID && (
                  <div className="" ref={exceptRef}>
                    <HiLightBulb
                      className=" shrink-0 text-xl transition-50 opacity-60 hover:opacity-100 cursor-pointer text-greenBtn "
                      onClick={() => {
                        setPromptOpen((prev) => !prev);
                      }}
                    />
                  </div>
                )}

                {promptOpen && (
                  <div ref={promptRef} className="right-[25px] bottom-[50px] absolute">
                    <PromptSection ref={promptRef} data={state.suggestedRes} />
                  </div>
                )}
                <button
                  className="shrink-0 text-xl opacity-50 hover:opacity-80 cursor-pointer  "
                  type="submit"
                  disabled={!state.receivedUser || state.loading || !state.text}
                >
                  {state.loading ? (
                    <ReactLoading
                      type="spin"
                      width={20}
                      height={20}
                      color="#7d838c"
                    />
                  ) : (
                    <AiOutlineSend />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
