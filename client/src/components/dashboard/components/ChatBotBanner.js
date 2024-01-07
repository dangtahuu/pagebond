import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

const ChatBotBanner = ({
  
  autoFetch,
 
  token,

}) => {
 
//   const [loading, setLoading] = useState(false);
//   const [list, setList] = useState([]);
  const navigate = useNavigate();

//   useEffect(() => {
//       getList();
//   }, []);

//   const getAssistant = async () => {
//     setLoading(true);
//     try {
//       const { data } = await autoFetch.get(
//         `/api/book/get-similar-books-multiple`
//       );
//       setList(data.books);
//     } catch (error) {
//       console.log(error);
//     }
//     setLoading(false);
//   };
let chatInfo = {
  name: "Assistant",
  _id: "658370b92d1567e8c71e3f39",
  image: {
    url: "http://res.cloudinary.com/dksyipjlk/image/upload/v1703112987/u30vyxopnjiwhbeso75w.webp",
  },
};
 
  return (
    <div
      className={`hidden md:block rounded-lg mt-2 px-5 w-full mb-4 md:mb-0 `}
    >
        <img className="object-cover rounded-lg" src="/images/chatbot.png"></img>
        <div className="flex items-center gap-x-2 my-2">
            <div className="text-xs">Our chat assistant at PageBond knows everything about books!</div>
            <button className="primary-btn text-xs w-[100px]"
            onClick={()=>{navigate(`/chat/?data=${encodeURIComponent(JSON.stringify(chatInfo))}`)}}
            >Ask now</button>
        </div>
    </div>
  );
};

export default ChatBotBanner;
