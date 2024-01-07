import { useEffect, useRef, useState } from "react";
import { AiOutlineCamera, AiOutlineSend } from "react-icons/ai";
import { HiLightBulb } from "react-icons/hi2";
import { MdCancel } from "react-icons/md";
import { PiBroom } from "react-icons/pi";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { useAppContext } from "../../context/useContext";
import useOnClickOutside from "../../hooks/useOnClickOutside";

const AI_ID = process.env.REACT_APP_AI_ID;

const MessageBox = ({
  state,
  handleSendMess,
  image,
  setImage,
  initImage,
  setPageState,
  emailInputRef,
  handleImage,
  text,
}) => {
  const { autoFetch, user } = useAppContext();

  const [prompts, setPrompts] = useState([]);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptLoading,setPromptLoading] = useState(false)
  const promptRef = useRef();
  const exceptRef = useRef();
  const [input, setInput] = useState(text);

  let currentConversation;
  currentConversation = state.allConversations.find(
    (one) => one._id === state.index
  );

  useEffect(()=>{
    getPrompts()
    
  },[])

  console.log(currentConversation)

  useOnClickOutside(
    promptRef,
    () => {
      console.log('aaaaaaa')
      setPromptOpen(false);
    }
  );

  const getPrompts = async () => {
    setPromptLoading(true)
    try {
      const { data } = await autoFetch.get(`/api/prompt/prompts`);
      console.log(data)
      setPrompts(data.prompts);
    } catch (error) {
      console.log(error);
    } finally {
      setPromptLoading(false)
    }
  };

  const PromptSection = ({ data }) => {
 
    if(data?.length===0 || !data) return <></>

    return (
      <div
        className={`flex flex-col items-center py-4 bg-navBar justify-center rounded-lg w-[450px]  mb-5 gap-y-2
          `}
      >
        {data.map((one) => (
              <div
                className="w-[400px] text-sm py-2 px-4 rounded-lg border-[1px] border-dialogue cursor-pointer"
                onClick={() => {
                  setInput(one.text)
                  setPromptOpen(false)
                }}
              >
                <div>{one.text}</div>
              </div>
            ))}
      </div>
    );
  };

  return (
    <div>
      {!state.allConversations.length && !state.isNewMessage ? (
        <></>
      ) : (
        <form
          className="flex-grow-0 py-3 px-4 relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMess(state.receivedUser, input);
            setInput("");
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
            {state.receivedUser[0]?._id === AI_ID && (
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!state.receivedUser || state.loading}
              ref={emailInputRef}
            />
            {state.receivedUser[0]?._id !== AI_ID && (
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

<div className="" ref={promptRef}>
            {state.receivedUser[0]?._id === AI_ID &&  
                typeof currentConversation !== "undefined" && (
             
                <HiLightBulb
                  className=" shrink-0 text-xl transition-50 opacity-60 hover:opacity-100 cursor-pointer text-greenBtn "
                  onClick={() => {
                    getPrompts();
                    setPromptOpen((prev) => !prev);
                  }}
                />
             
            )}
             </div>

            {state.receivedUser[0]._id === AI_ID &&
              !input &&
              (currentConversation?.content?.length === 0 ||
                typeof currentConversation === "undefined") && (
                  <div
                
                  className="right-[25px] bottom-[50px] absolute"
                >
                  <PromptSection  data={prompts} /></div>
              )}

            {promptOpen && (
              <div
               
                className="right-[25px] bottom-[50px] absolute"
              >
                <PromptSection data={prompts} />
              </div>
            )}

            <button
              className="shrink-0 text-xl opacity-50 hover:opacity-80 cursor-pointer  "
              type="submit"
              disabled={!state.receivedUser || state.loading || !input}
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
  );
};

export default MessageBox;
