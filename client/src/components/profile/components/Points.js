import React, { useEffect, useState } from "react";
import { LoadingCard } from "../..";
import { ModalShelf } from "../..";
import { FiFolderPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { Rating } from "@mui/material";
import { IoBookOutline } from "react-icons/io5";
import { AiOutlineInfoCircle } from "react-icons/ai";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);

  // Convert to local time zone
  const localTime = date.toLocaleString();

  return localTime;
};

const notiText = {
  1: "has followed you",
  2: "has unfollowed you",
  3: "has liked your post",
  4: "has unliked your post",
  5: "has commented on your post",
  6: "has removed comment on your post",
  7: "has sent you",
};

const voucherTypes = [{
    type:1,
    points: 1000,
    prize: "10,000VND discount",
    text: "Tiki",
},{
    type:2,
    points: 3000,
    prize: "50,000VND discount",
    text: "Tiki",
},{
    type:3,
    points: 5000,
    prize: "100,000VND discount",
    text: "Tiki",
},{
    type:4,
    points: 1000,
    prize: "10,000VND discount",
    text: "Shopee",
},{
    type:5,
    points: 3000,
    prize: "50,000VND discount",
    text: "Shopee",
},{
    type:6,
    points: 5000,
    prize: "100,000VND discount",
    text: "Shopee",
}
]

const Points = ({ user,setUser,  userId, autoFetch, navigate }) => {
  const initList = {
    name: "",

    _id: "",
  };

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [text, setText] = useState("");

  useEffect(() => {
    getLogs();
  }, []);

  const getLogs = async () => {
    console.log(`aaaaaaaaaaaaa`);
    try {
      const { data } = await autoFetch.get(`/api/log/logs`);
      setLogs(data.logs);
      console.log(data.logs);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const redeem = async (type) => {
    console.log(`ccccc`);
    try {
      const { data } = await autoFetch.patch(`/api/voucher/redeem`,{
        type
      });
   
      setUser((prev)=> ({...prev, points: prev.points-data.log.points}))

      toast.success("Redeem successfully")
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingCard />;
  }

  return (
    <div className={`w-full p-4 rounded-lg `}>
      <div className="flex justify-between"></div>

      <div className="text-2xl text-white serif-display ">Your points</div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-x-3">
          <img className="w-[50px]" src="/images/points.png" />
          <div className="serif-display text-3xl ">{user.points} Coins</div>
          <AiOutlineInfoCircle  className="text-2xl"/>
        </div>
        <button className="bg-greenBtn text-sm rounded-full py-1 px-2">My wallet</button>

      </div>

    <div className="grid grid-cols-3 gap-x-5 mt-5">
        {voucherTypes.map((data)=><Voucher data={data} redeem={redeem}/>)}
    </div>

      <div className="text-2xl text-white serif-display ">History</div>
      {logs.length > 0 ? (
        <div className="text-sm my-4 gap-1 text-bold ">
          {logs.map((noti) => (
            <div className="gap-x-5 p-4 mb-4 flex justify-between border-b-[1px] border-b-dialogue items-center">
              <div>
                <span className="text-gray-500 mr-6">
                  {formatDate(noti.createdAt)}
                </span>
                <span className="font-semibold">{noti?.fromUser?.name}</span>{" "}
                {notiText[noti.type]}{" "}
                <span className="font-semibold">
                  {(noti.type === 3 || noti.type === 5 || noti.type === 9) &&
                    noti?.linkTo?.text}
                </span>
                <span className="font-semibold">
                  {noti.type === 7 && noti?.points}
                </span>
              </div>
              <div>
                {noti.points > 0 ? `+${noti.points}` : `${noti.points}`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className=" w-full text-center my-5  ">
          User has no shelves yet!
        </div>
      )}
    </div>
  );
};

export default Points;

const Voucher = ({data, redeem}) => {
    return (
        <div
        className="flex flex-col items-center mb-3 md:flex-row w-full "
        //   key={a.suggestedBook._id}
      >
        <div
          className="object-cover flex justify-center items-center h-[100px] bg-greenBtn cursor-pointer w-[80px] md:rounded-l-lg"
          // src={a.suggestedBook.thumbnail || "https://sciendo.com/product-not-found.png"}
          alt=""
          // onClick={() => navigate(`/book/${a.suggestedBook._id}`)}
        >
          <div className="text-xl">{data.text}</div>

        </div>
        <div className="flex justify-between items-center gap-x-4 p-2 bg-dialogue rounded-r-lg h-[100px]">
            <div className="flex flex-col justify-between">
            <p
            className="mb-1 text-sm cursor-pointer"
            // onClick={() => navigate(`/book/${a.suggestedBook._id}`)}
          >
            {data.prize}
          </p>
          <p className="mb-1 text-sm">{data.points} points</p>

          <button className="bg-greenBtn text-sm rounded-full py-1 px-2" onClick={()=>redeem(data.type)}>Redeem</button>
            </div>
            <AiOutlineInfoCircle  className="text-2xl"/>

        </div>
      </div>
    )
}
