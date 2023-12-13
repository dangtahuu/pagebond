import { Avatar } from "@mui/material";

const CLICK_TO_BOX_MESSAGE = "CLICK_TO_BOX_MESSAGE";

const BoxChat = ({ setPageState, state, getData, user, dispatch }) => {
  const boxUser = (m) => {
    return (
      <>
        {m.members.map((receivePeople, k) => {
          if (user && receivePeople._id === user._id) {
            return;
          }
          return (
            <div
              key={k}
              onClick={() => {
                setPageState("receiveUser", receivePeople);
              }}
              className="dialogue-wrapper flex items-center "
            >
              <Avatar
                src={
                  receivePeople && receivePeople.image
                    ? receivePeople.image.url
                    : ""
                }
                alt="avatar"
                className="w-10 h-10 bg-white border-[1px] border-[#8eabb4] "
              />
              <div className="pl-3 w-full pr-[20%] hidden md:flex flex-col ">
                <strong className="hidden md:flex flex-grow  ">
                  {receivePeople ? receivePeople.name : ""}
                </strong>
                <div className="last-mess text-ellipsis w-full hidden md:flex ">{`${
                  user &&
                  m &&
                  m.content &&
                  m.content[m.content.length - 1].sentBy._id === user._id
                    ? "You: "
                    : ""
                }  ${
                  m && m.content ? m.content[m.content.length - 1].text : ""
                }`}</div>
              </div>
            </div>
          );
        })}
      </>
    );
  };
  const colLeft = () => {
    if (!state.allMessages) return "Nothing....";
    return state.allMessages.map((m, id) => {
      return (
        <div
          key={id}
          className={` col-left ${
            m._id === state.index ? "active" : ""
          } md:p-2.5  md:h-auto rounded-lg `}
        >
          <div
            role="button"
            className={`flex `}
            onClick={() => {
              dispatch({
                type: CLICK_TO_BOX_MESSAGE,
                payload: {
                  index: m._id,
                },
              });
            }}
          >
            {m && (
              <div className="w-full h-full items-start flex">{boxUser(m)}</div>
            )}
          </div>
        </div>
      );
    });
  };
  return (
    <div className="overflow-x-hidden">
      <div className="overflow-x-hidden">
        <div className="flex justify-between items-center pt-4">
          <h2 className="serif-display text-xl sm:text-2xl md:text-3xl  ">
            Chats
          </h2>
        </div>

        <div className="flex items-center transition-50 my-1 pr-2 ">
          {state.isNewMessage ? (
            <div className="my-3 bg-greenBtn w-full py-2 text-white rounded-lg ">
              <div className="flex items-start px-1 md:px-3  ">
                <div className="text-[13px] md:text-base flex flex-wrap ">
                  New message
                </div>
              </div>
            </div>
          ) : (
            <div className="flex rounded-2xl rounded-lg w-full border-[1px] border-dialogue px-1 md:px-2 my-2 "></div>
          )}
        </div>
      </div>

      <div className="cot-trai max-h-[70vh] md:h-[67vh] overflow-x-hidden ">
        {!state.isNewMessage && colLeft()}
      </div>
    </div>
  );
};

export default BoxChat;
