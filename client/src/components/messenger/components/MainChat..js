import React from "react";
import { Tooltip, Avatar } from "@mui/material";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import { CgTrashEmpty } from "react-icons/cg";
import ReactLoading from "react-loading";
import prompts from "../../../consts/prompts";
import shuffle from "../../../utils/shuffle";
import { useEffect } from "react";

const MainChat = ({
  state,
  user,
  messagesEndRef,
  dispatch,
  navigateToProfile,
  handleDeleteMess,
  setPageState,
  AI_ID,
}) => {

  const PromptSection = () => {
    let shuffled = shuffle(prompts);
    const data = shuffled.slice(0, 5);

    return (
      <div className="flex flex-col items-center justify-center absolute w-full bottom-0 mb-5 gap-y-2">
        {data.map((one) => (
          <div className="w-[400px] bg-dialogue text-sm rounded-full py-2 px-4 cursor-pointer"
          onClick={()=>setPageState("text", one)}
          >
            <div>{one}</div>
          </div>
        ))}
      </div>
    );
  };

  let currentMessenger;

  useEffect(() => {
    console.log(state);
    console.log(currentMessenger);
    console.log(state.receiveUser._id)
    console.log(AI_ID)
    console.log('sosanh',state.receiveUser._id === AI_ID )
  }, [state]);

  const messBox = () => {
    currentMessenger = state.allMessages.find((m) => m._id === state.index);

    if (currentMessenger && currentMessenger.content && user) {
      // @ts-ignore
      return currentMessenger.content.map((c) => {
        return (
          <div
            key={c?._id}
            className={`chat-message w-full group chat-message-${
              c?.sentBy?._id === user?._id ? "right" : "left mb-2"
            } flex items-center `}
          >
            {c.sentBy._id === user._id ? (
              <></>
            ) : (
              <div
                className="flex image "
                onClick={() => navigateToProfile(c._id)}
              >
                <Avatar
                  src={
                    c && c.sentBy && c.sentBy.image ? c.sentBy.image.url : ""
                  }
                  className="mr-1 border-[1px] border-[#8EABB4] rounded-full w-8 h-8 cursor-pointer "
                  alt="AVATAR"
                />
              </div>
            )}
            <div className="flex items-center relative max-w-[50%] ">
              <Tooltip
                title={moment(c.created).fromNow()}
                placement={c.sentBy._id === user._id ? "top" : "top"}
              >
                <div
                  className={`order-1 chat-element md:max-w-[70%] break-words  rounded-2xl md:rounded-[25px] ${
                    c.sentBy._id === user._id
                      ? "bg-greenBtn "
                      : "bg-dialogue box-shadow "
                  }  px-3 py-2 ml-1 dark:text-white`}
                >
                  <ReactMarkdown>
                    {c.text ? c?.text.replace(/\[\^\d+\^\]/g, ""):""}
                  </ReactMarkdown>
                  {c.image?.url && (
                    <img
                      src={c.image?.url}
                      alt="attachment"
                      className="max-h-[300px] w-auto object-contain rounded-md "
                    />
                  )}
                </div>
              </Tooltip>
              <div
                className={`flex items-center absolute gap-x-1 text-xl h-full opacity-50 text-mainText ${
                  c.sentBy._id === user._id
                    ? "left-[-45px] flex-row-reverse  "
                    : "right-[-45px] "
                }  `}
              >
                <CgTrashEmpty
                  onClick={() => handleDeleteMess(state.index, c._id)}
                  className="hidden cursor-pointer shrink-0 group-hover:flex "
                />
              </div>
            </div>
          </div>
        );
      });
    }
    return <></>;
  };

  if (!state.allMessages.length && !state.isNewMessage) {
    return (
      <div className="text-center" style={{ marginTop: "50%" }}>
        It's empty here. Let's send someone a message
      </div>
    );
  }
  return (
    <>
      <div className="px-4 py-2 border-bottom d-none d-lg-block ml-[7px]">
        <div className="flex items-center py-1">
          {/* list avatar */}
          <div className="relative">
            <div className="h-10">
              {state.receiveUser && state.receiveUser.image && (
                <Avatar
                  src={
                    state.receiveUser && state.receiveUser.image
                      ? state.receiveUser.image.url
                      : ""
                  }
                  className="w-10 h-10 mr-1 border rounded-full cursor-pointer dark:border-white "
                  alt="avatar"
                  onClick={() => navigateToProfile(state.receiveUser._id)}
                />
              )}
            </div>
          </div>

          {/* list name */}
          <div className="w-full pl-3 grow text-ellipsis">
            <strong>{state.receiveUser ? state.receiveUser.name : ""}</strong>
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          className="chat-messages p-2 md:p-4 flex dark:bg-[#242526]"
          style={{ margin: "0 7px" }}
        >
          {messBox()}
          <div ref={messagesEndRef} />
          {state.receiveUser._id === AI_ID && !state.text&&
            (currentMessenger?.content?.length === 0 || typeof currentMessenger === 'undefined') &&
              <PromptSection />
          }
          {state.AILoading && (
            <div className="flex items-center w-[200px] bg-dialogue text-sm rounded-full py-2 px-3">
              <div>AI is replying </div>
              <ReactLoading
                type="bubbles"
                width={20}
                height={20}
                color="white"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MainChat;
