/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Tooltip, Avatar } from "@mui/material";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import { CgTrashEmpty } from "react-icons/cg";
import ReactLoading from "react-loading";
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
 

  let currentConversation;
  currentConversation = state.allConversations.find(
    (one) => one._id === state.index
  );

  const Content = () => {
    if (currentConversation && currentConversation.content) {
      return currentConversation.content.map((c) => {
        return (
          <div
            key={c?._id}
            className={`w-full my-1 group ${
              c?.sentBy?._id === user?._id
                ? "flex-row-reverse ml-auto"
                : "mr-auto"
            } flex items-center `}
          >
            {c.sentBy._id === user._id ? (
              <></>
            ) : (
              <div className="flex" onClick={() => navigateToProfile(c._id)}>
                <img
                  src={c?.sentBy?.image ? c.sentBy.image.url : ""}
                  className="mr-1 rounded-full w-8 h-8 cursor-pointer "
                />
              </div>
            )}
            <div className="flex items-center justify-end relative max-w-[50%] ">
              <Tooltip title={moment(c.created).fromNow()} placement={"top"}>
                <div
                  className={`order-1 break-words rounded-2xl ${
                    c.sentBy._id === user._id
                      ? "bg-greenBtn "
                      : "bg-dialogue box-shadow "
                  }  px-3 py-2 ml-1 prose text-mainText`}
                >
                  <ReactMarkdown>
                    {c.text ? c?.text.replace(/\[\^\d+\^\]/g, "") : ""}
                  </ReactMarkdown>
                  {c.image?.url && (
                    <img
                      src={c.image?.url}
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
                  onClick={() => {
                    if (!window.confirm("Do you want to delete this message?")) return;
                    handleDeleteMess(c._id)}}
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

  if (!state.allConversations.length && !state.isNewMessage) {
    return (
      <div className="text-center" style={{ marginTop: "50%" }}>
        It's empty here. Let's send someone a message
      </div>
    );
  }
  return (
    <>
      <div className="px-6 py-2 border-bottom  flex flex-col">
        <div className="flex items-center py-2 border-b-[1px] border-dialogue">
          <div className="relative">
            <div className="h-10">
              {currentConversation?.name ? (
                <div class="flex -space-x-3 rtl:space-x-reverse">
                  {currentConversation.members.slice(0, 4).map((one) => (
                    <img
                      class="w-8 h-8 border-2 border-white rounded-full"
                      src={one.image.url}
                      alt=""
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={
                    state.receivedUser[0]?.image
                      ? state.receivedUser[0]?.image?.url
                      : ""
                  }
                  className="w-10 h-10 mr-1 rounded-full cursor-pointer"
                  onClick={() => navigateToProfile(state.receivedUser[0]?._id)}
                />
              )}
            </div>
          </div>

          <div className="w-full pl-3 grow text-ellipsis font-semibold">
            {currentConversation?.name
              ? currentConversation.name
              : state.receivedUser[0]?.name}
          </div>
        </div>
      </div>
      <div className="relative mx-6 flex-1 overflow-y-auto style-3 overflow-x-hidden shadow shadow-gray-900 shadow-inner rounded-md">
        <div className="p-2 md:p-4 flex flex-col my-2">
          <Content />

          <div ref={messagesEndRef} />

        
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
