import { useState } from "react";
import { useAppContext } from "../../../context/useContext";
import { GoPlusCircle } from "react-icons/go";
import CreateGroupForm from "./CreateGroupForm";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const CLICK_TO_BOX_MESSAGE = "CLICK_TO_BOX_MESSAGE";
const EXIT_NEW_MESSAGE = "EXIT_NEW_MESSAGE"

const Left = ({ setPageState, state, getData, dispatch }) => {
  const { user } = useAppContext();
const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(false)

  const Conversation = ({ data }) => {
    const members = data.members.filter((one) => one._id !== user._id);
    return (
      <div
        onClick={() => {
          setPageState("receivedUser", members);
        }}
        className="w-full h-full flex items-center "
      >
        <div className="flex gap-x-3 items-center">
          <div class="flex -space-x-3 rtl:space-x-reverse">
            {members.slice(0, 4).map((one) => (
              <img
                class="w-8 h-8 border-2 border-white rounded-full"
                src={one.image.url}
                alt=""
              />
            ))}
          </div>
          <div>
            <div> {data?.name ? data.name : members[0]?.name}</div>
            <div>
              {data?.content?.length > 0 &&
                data.content[data.content.length - 1].text}
            </div>
          </div>
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
          className={` p-[10px] ${
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
                  index: state._id,
                },
              });
            }}
          >
            {one && (
                <Conversation data={one} />
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="">
      {openModal && <CreateGroupForm setOpenModal={setOpenModal} dispatch={dispatch}/> }
      <div className="flex justify-between items-center pt-4 ">
        <h2 className="serif-display text-xl sm:text-2xl md:text-3xl  ">
          Chats
        </h2>
        <GoPlusCircle className="text-lg"
        onClick={()=>{
          setOpenModal(true)
        }}
        />

      </div>

      <div className="flex items-center transition-50 my-1 pr-2 ">
        {state.isNewMessage && (
          <div className="my-3 bg-greenBtn w-full py-2 px-2 text-white rounded-lg flex items-center justify-between ">
            <div>New message</div>
            <IoClose className="cursor-pointer" onClick={()=>{
              
               dispatch({
                type: EXIT_NEW_MESSAGE,
                payload: {
                 receivedUser:state.allConversations[0].members.filter((one)=>one._id!==user._id),
                  index: state.allConversations[0]._id,
                },
              });
              navigate('/messenger')
            }}/>
          </div>
        )}
      </div>

      <div className="flex flex-col max-h-[70vh] overflow-y-auto overflow-x-hidden style-3 px-2 ">
        {!state.isNewMessage && <ConversationList />}
      </div>
    </div>
  );
};

export default Left;
