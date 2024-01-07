import { useState } from "react";
import { GoPlusCircle } from "react-icons/go";
import CreateGroupForm from "./components/CreateGroupForm";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/useContext";

const CLICK_TO_BOX_MESSAGE = "CLICK_TO_BOX_MESSAGE";
const EXIT_NEW_MESSAGE = "EXIT_NEW_MESSAGE";

const LeftChat = ({ setPageState, state, getData, dispatch }) => {
  const { user, unreadMessages } = useAppContext();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const Conversation = ({ data }) => {
    const members = data.members.filter((one) => one._id !== user._id);
    return (
      <div
        onClick={() => {
          setPageState("receivedUser", members);
        }}
        className="w-full h-full flex items-center "
      >
        <div className="flex items-center justify-between w-full">
        <div className="flex gap-x-3 items-center">
          <div class="flex -space-x-3 rtl:space-x-reverse min-w-[30px]">
            {members.slice(0, 4).map((one) => (
              <img
                class="w-8 h-8 border-2 border-white rounded-full"
                src={one.image.url}
                alt=""
              />
            ))}
          </div>
          <div>
            <div className="font-semibold">
              {" "}
              {data?.name ? data.name : members[0]?.name}
            </div>
            <div className="text-sm">
              {data?.content?.length > 0 &&
                data.content[data.content.length - 1].text.slice(0, 25)}
            </div>
          </div>
        </div>
        {unreadMessages.some((one)=>one._id===data._id) && (
          <div className="rounded-full bg-greenBtn w-[10px] h-[10px]"></div>
        )}
        </div>
        
      </div>
    );
  };

  const ConversationList = () => {
    if (!state.allConversations) return "You have no chats yet!";
    return state.allConversations.map((one, index) => {
      return (
        <div
          key={index}
          className={`p-[10px] ${
            one._id === state.index ? "bg-altDialogue" : ""
          } rounded-lg `}
        >
          <div
            role="button"
            className={`flex `}
            onClick={() => {
              dispatch({
                type: CLICK_TO_BOX_MESSAGE,
                payload: {
                  index: one._id,
                },
              });
            }}
          >
            {one && <Conversation data={one} />}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="">
      {openModal && (
        <CreateGroupForm setOpenModal={setOpenModal} dispatch={dispatch} />
      )}
      <div className="flex justify-between items-center pt-4 pb-2">
        <h2 className="serif-display text-xl sm:text-2xl md:text-3xl  ">
          Chats
        </h2>
        <div className="text-lg">
          <GoPlusCircle
            onClick={() => {
              setOpenModal(true);
            }}
          />
        </div>
      </div>

      {state.isNewMessage && (
        <div className="flex items-center transition-50 my-1 pr-2 ">
          <div className="my-3 bg-greenBtn w-full py-2 px-2 text-white rounded-lg flex items-center justify-between ">
            <div>New message</div>
            <IoClose
              className="cursor-pointer"
              onClick={() => {
                dispatch({
                  type: EXIT_NEW_MESSAGE,
                  payload: {
                    receivedUser: state.allConversations[0].members.filter(
                      (one) => one._id !== user._id
                    ),
                    index: state.allConversations[0]._id,
                  },
                });
                navigate("/chat");
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col max-h-[70vh] overflow-y-auto overflow-x-hidden style-3 pr-2">
        {!state.isNewMessage && <ConversationList />}
      </div>
    </div>
  );
};

export default LeftChat;
