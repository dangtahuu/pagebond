import React, { useEffect, useRef, useReducer, useState } from "react";
import { AiOutlineCamera, AiOutlineSend } from "react-icons/ai";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";

import { useNavigate, useLocation } from "react-router-dom";
//components
import { useAppContext } from "../../context/useContext";
import {LeftChat, MainChat, MessageBox} from "../../components/index"

import { PiBroom } from "react-icons/pi";

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
        thread: action.payload.thread || null,
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

const Chat = () => {
  const { user, autoFetch, setOneState, socket } =
    useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dataString = queryParams.get("data");
  const newMessageData = JSON.parse(decodeURIComponent(dataString));


  const initState = {
    receivedUser: [],
    allConversations: [], // all message
    index: "", /// _id of that message is showing
    text: "", /// text in input send new message
    loading: false, // loading
    AILoading: false,
    isNewMessage: false, // Mode new message
    context: true,
    thread: "",
  };

  const [state, dispatch] = useReducer(reducer, initState);
  const [scrLoading, setScrLoading] = useState(false);

  useEffect(() => {
   console.log(state)
  }, [state]);

  useEffect(() => {
    if (state.index) markasRead();
  }, [state.index]);

  

  const messagesEndRef = useRef();
  const emailInputRef = useRef();

 
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
       markasRead()
      }
    };

    let change = false;
    if (state.allConversations) {
      // socket
      if (user) {

        document.addEventListener('visibilitychange', handleVisibilityChange);

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

          console.log(state.index)

          console.log(document.visibilityState)
          if (document.visibilityState === "visible") 
          {
            console.log('777777')
            markasRead();
          
          }
          
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.off("new-message");
    };
  }, [state]);

  const getData = async () => {
    setScrLoading(true);
    let receiverData;
    try {
      const { data } = await autoFetch.get("api/chat/all");

      if (newMessageData) {
        receiverData = {
          name: newMessageData.name,
          _id: newMessageData._id,
          image: { url: newMessageData.image.url },
          text: newMessageData.text || "",
        }; 

      }

      let checkNew = []
      if (data.conversations.length > 0) {
        if (user) {
          var us = data.conversations[0].members.filter((m) => m._id !== user._id);
        }
        if(receiverData) {
          checkNew = data.conversations.filter((one)=>{
            const filteredMem = one.members.filter((m) => m._id !== user._id)
            if (filteredMem===[receiverData]) return true;
            else return false
          })
        }
            }

            console.log(checkNew)

      dispatch({ 
        type: GET_DATA_SUCCESS,
        payload: {
          allConversations: data.conversations,
          receivedUser: receiverData ? [receiverData] : [us[0]],
          isNewMessage: receiverData ? true : false,
          index: !receiverData? data.conversations[0]._id: checkNew.length>0? checkNew[0]._id : null,
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

  const handleUpImageToCloud = async () => {
    try {
      const { data } = await autoFetch.post(`/api/post/upload-image`, formData);
      return { url: data.url, public_id: data.public_id };
    } catch (error) {
      toast.error("Upload image fail!");
      return initImage;
    }
  };

  const handleDeleteMess = async (messageId) => {

    try {
      const { data } = await autoFetch.patch("/api/chat/delete-message", {
        messageId
      });

      let newSourceData = state.allConversations.map((each) => {
        if (each._id === data.conversation._id) {
          return data.conversation;
        }
        return each;
      });

      newSourceData = newSourceData.filter((each) => each.content.length !== 0);

      dispatch({
        type: HANDLE_DELETE_MESSAGE,
        payload: {
          allConversations: newSourceData,
          index: data.conversation.content.length !== 0 ? data.conversation._id : "0",
        },
      });

      toast.success("Delete successfully!")
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.msg) {
        toast.error(error.response.data.msg);
      }
    }
  };

  const handleSendMess = async (received, input) => {
    setLoading(true);
    console.log('bbbbbbb',input)
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
        text: input,
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
        navigate('/chat')
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
      handleAIRes(input);
    }
  };

  const handleAIRes = async (text) => {
    setAILoading(true);
    try {
      let reqData;
      if (state.thread && state.context) {
        reqData = {
          text,
          thread: state.thread,
        };
      } else reqData = { text };

      const { data } = await autoFetch.put("/api/chat/get-ai-res", reqData);
      
      let id = "";

      let newSourceData = state.allConversations.filter((one) => {
        if (one._id === data.conversation._id) {
          id = one._id;
          one.content = data.conversation.content;
        }
        return one;
      });

      let mainData;
      mainData = id ? newSourceData : [data.conversation, ...state.allConversations];

      dispatch({
        type: HANDLE_SEND_MESSAGE,
        payload: {
          allConversations: mainData,
          index: data.conversation._id,
         thread: data.thread,
          context: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
    setAILoading(false);
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
          <LeftChat
            dispatch={dispatch}
            getData={getData}
            setPageState={setPageState}
            state={state}
          />
        </div>
        <div className="col-span-3 flex flex-col max-h-[90vh]">
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

          <div className="mb-5">
            <MessageBox
             state={state}
             handleSendMess={handleSendMess}
             image={image}
             setImage={setImage}
             initImage={initImage}
             setPageState={setPageState}
             emailInputRef={emailInputRef}
             handleImage={handleImage}
             text={state.text}
             />
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default Chat;
