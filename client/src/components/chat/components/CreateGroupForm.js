import { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { useAppContext } from "../../../context/useContext";
import useDebounce from "../../../hooks/useDebounce";
import useOnClickOutside from "../../../hooks/useOnClickOutside";

const GET_DATA_SUCCESS = "GET_DATA_SUCCESS";

const CreateGroupForm = ({ setOpenModal, dispatch }) => {
  const { autoFetch, user } = useAppContext();

  const [input, setInput] = useState({
    title: "",
    people: [],
  });
  const [person, setPerson] = useState("");

  const hashtagDebounce = useDebounce(person, 500);
  const [listPeopleSearch, setListPeopleSearch] = useState([]);
  const [isSearchingPeople, setIsSearchingPeople] = useState(false);

  const searchRef = useRef();
  const exceptRef = useRef();

  const [isEmpty, setIsEmpty] = useState(false);

  useOnClickOutside(
    searchRef,
    () => {
      setIsSearchingPeople(false);
    },
    exceptRef
  );

  useEffect(() => {
    searchPeople();
  }, [hashtagDebounce]);

  const searchPeople = async () => {
    if (!person) {
      setListPeopleSearch([]);
      return;
    }
    try {
      const { data } = await autoFetch.get(
        `/api/auth/search?term=${encodeURIComponent(JSON.stringify(person))}`
      );
      if (data.results.length === 0) {
        setListPeopleSearch([]);
      } else {
        setListPeopleSearch(data.results);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickResult = (item) => {
    setPerson("");
    setInput((prev) => ({ ...prev, people: [...prev.people, item] }));
    setListPeopleSearch([]);
    setIsSearchingPeople(false);
  };

  const ResultList = () => {

    return (
      <div className="" ref={exceptRef}>
        {listPeopleSearch.filter(one=> one._id!==user._id).map((item) => {
          return (
            <div
              className="py-2 cursor-pointer flex items-center gap-x-2 hover:font-bold"
              key={item._id}
              onClick={() => handleClickResult(item)}
            >
              <img className="w-8 h-8 rounded-full" src={item.image.url}/>
              <div>{item.name}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleButton = () => {
    if (!input.title) {
      return toast.error("Enter a name for your group chat");
    }
    if (input.people.length < 2) {
      console.log(input.people)
      return toast.error("Choose at least 2 people to create a group chat");
    }
    createConversation();
    setOpenModal(false);
  };

  const createConversation = async () => {
    try {
      const { data } = await autoFetch.post(`api/chat/group`, {
        name: input.title,
        people: input.people.map((one) => one._id),
      });
      console.log(data.conversation)
      console.log(data.conversation.members.filter((one)=>{
        return one !==user._id}))
      const { data: allData } = await autoFetch.get("api/chat/all");
      dispatch({
        type: GET_DATA_SUCCESS,
        payload: {
          allConversations: allData.conversations,
          receivedUser: data.conversation.members.filter(
            (one) => one._id !== user._id
          ),
          isNewMessage: false,
          index: allData.conversations[0]._id,
          text: "",
        },
      });
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className=" fixed flex items-center justify-center w-screen h-screen bg-black/50 z-[200] top-0 left-0 ">
      <div
        className="z-[201] bg-none fixed w-full h-full top-0 right-0 "
        onClick={() => {
          setOpenModal(false);
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
            Create group chat
          </div>

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

          <div className="relative">
            <input
              className="standard-input"
              placeholder="Type the hashtag"
              value={person}
              ref={searchRef}
              onChange={(e) => {
                setPerson(e.target.value);
              }}
              onFocus={() => {
                setIsSearchingPeople(true);
              }}
            />

            {isSearchingPeople && listPeopleSearch?.length > 0 && (
              <div className="scroll-bar min-w-[100px] min-h-[20px] bottom-[50px] text-mainText text-xs p-2 absolute bg-altDialogue max-h-[300px] rounded-lg overflow-y-auto overflow-x-hidden">
                <ResultList />
              </div>
            )}
          </div>

          <div>
          {input.people.length > 0 && (
              <div className="flex items-center gap-x-1 mr-2">
                {input.people.map((one, index) => (
                  <div className="relative text-xs text-mainText inline-block rounded-full bg-dialogue px-2 py-1">
                  <div className="flex items-center gap-x-2">
                  <img className="rounded-full h-8 w-8" src={one.image.url}/>
                    <div>{one.name}</div>
                  </div>
                    <IoClose
                      className="text-xs cursor-pointer bg-mainbg rounded-full absolute -top-[5px] -right-[2px]"
                      onClick={() => {
                        setInput((prev) => {
                          let people = prev.people;
                          people.splice(index, 1);
                          return { ...prev, people };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 mb-3">
          <button
            className={`primary-btn w-[100px] block`}
            onClick={handleButton}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupForm;
