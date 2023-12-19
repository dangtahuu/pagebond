import React, { useEffect, useState } from "react";
import { LoadingCard } from "../..";
import { ModalShelf } from "../..";
import { FiFolderPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { Rating } from "@mui/material";
import { IoBookOutline } from "react-icons/io5";
import { AiOutlineInfoCircle } from "react-icons/ai";
import ReactLoading from "react-loading";
import { BsTicketPerforated } from "react-icons/bs";
import HeaderMenu from "../../common/HeaderMenu";

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
  8: "have sent",
  9: "have redeemed voucher",
};

const Points = ({ user, setUser, userId, autoFetch, navigate }) => {
  const initList = {
    name: "",

    _id: "",
  };

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [redeemed, setRedeemed] = useState([]);
  const list = ["List", "My wallet"];
  const [menu, setMenu] = useState("List");

  const historyList = [
    "All",
    "Following",
    "Likes",
    "Comments",
    "Gifted",
    "Vouchers",
  ];
  const [historyMenu, setHistoryMenu] = useState("All");

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        await getLogs();
        await getVouchers();
      } catch (e) {
        console.log(e);
      }

      setLoading(false);
    };
    getData();
  }, []);

  const getLogs = async () => {
    try {
      const { data } = await autoFetch.get(`/api/log/logs/${user._id}`);
      setLogs(data.logs);
      const voucher_type = data.logs.filter(
        (one) => one.type === 9 && one.isRead === false
      );
      setRedeemed(voucher_type);
      // handleHistoryMenu(historyMenu)
    } catch (error) {
      console.log(error);
    }
  };

  const getVouchers = async () => {
    console.log(`aaaaaaaaaaaaa`);
    try {
      const { data } = await autoFetch.get(`/api/voucher/all-remaining`);
      setVouchers(data.vouchers);
      console.log(data.vouchers);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const redeem = async (id) => {
    try {
      const { data } = await autoFetch.patch(`/api/voucher/redeem`, {
        id,
      });
      setUser((prev) => ({ ...prev, points: prev.points + data.log.points }));
      toast.success("Redeem successfully");
    } catch (error) {
      console.log(error);
    }
    getLogs();
  };

  const markAsUsed = async (id) => {
    try {
      const { data } = await autoFetch.patch(`/api/log/logs/mark-used`, {
        id,
      });

      setRedeemed((prev) => {
        return prev.filter((one) => one._id !== data.log._id);
      });

      toast.success("You haved mark this voucher as used!");
    } catch (error) {
      console.log(error);
    }
  };

  const handeClickLogs = (data) => {
    console.log(data)
      switch (data.typeOfLink) {
        case "User":
          if(data.type===7) navigate(`/profile/${data.fromUser._id}`);
          else navigate(`/profile/${data.linkTo._id}`)
          break;
        case "Post":
          navigate(`/detail/post/${data.linkTo._id}`);
          break;
        case "Trade":
          navigate(`/detail/trade/${data.linkTo._id}`);
          break;
        case "Review":
          navigate(`/detail/review/${data.linkTo._id}`);
          break;
        case "Question":
          navigate(`/detail/question/${data.linkTo._id}`);
          break;
        case "SpecialPost":
          navigate(`/detail/special/${data.linkTo._id}`);
          break;
        default:
          break;
      }
    
  };

  const Voucher = ({ data }) => {
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
          <BsTicketPerforated className="text-3xl" />
        </div>
        <div className="flex justify-between items-center gap-x-4 p-2 bg-dialogue rounded-r-lg h-[100px] flex-1">
          <div className="flex flex-col justify-between">
            <p
              className="mb-1 text-sm cursor-pointer"
              // onClick={() => navigate(`/book/${a.suggestedBook._id}`)}
            >
              {menu === "List" ? data?.name : data?.note}
            </p>
            <p className="mb-1 text-sm">
              {" "}
              {menu === "List"
                ? data?.points
                : `${data?.linkTo?.name} - ${data?.linkTo?.points}`}{" "}
              points
            </p>

            <button
              className="bg-greenBtn text-sm rounded-full py-1 px-2"
              onClick={() => {
                if (menu === "List") redeem(data._id);
                else markAsUsed(data._id);
              }}
            >
              {menu === "List" ? `Redeem` : `Mark as used`}
            </button>
          </div>
          <AiOutlineInfoCircle className="text-2xl" />
        </div>
      </div>
    );
  };

  const VoucherSection = () => {
    if (vouchers.length === 0)
      return (
        <div className="mt-5 text-lg w-full px-[20%] flex justify-center">
          There's currently no voucher available
        </div>
      );
    return (
      <div className="grid grid-cols-3 gap-x-5 mt-5">
        {vouchers.map((data) => (
          <Voucher key={data._id} data={data} />
        ))}
      </div>
    );
  };

  const WalletSection = () => {
    if (redeemed.length === 0)
      return (
        <div className="mt-5 text-lg w-full px-[20%] flex justify-center">
          Post, earn points and redeem vouchers for them to appear here
        </div>
      );
    return (
      <div className="grid grid-cols-3 gap-x-5 mt-5">
        {redeemed.map((data) => (
          <Voucher key={data._id} data={data} />
        ))}
      </div>
    );
  };

  const HistorySection = ({ data, menu }) => {
    let filteredData = []
    switch (menu) {
      case "All": {
        filteredData= data;
         break;
      }
      case "Following": {
        filteredData = data.filter((one) => one.type === 1 || one.type === 2);
        break;
      }
      case "Likes": {
        filteredData = data.filter((one) => one.type === 3 || one.type === 4);
         break;
      }
      case "Comments": {
        filteredData = data.filter((one) => one.type === 5 || one.type === 6);
         break;
      }
      case "Gifted": {
        filteredData =  data.filter((one) => one.type === 7);
         break;
      }
      case "Vouchers": {
        filteredData =  data.filter((one) => one.type === 9);
         break;
      }
      default:
        break;
    }

    return (
      <div>
        {filteredData.length > 0 ? (
          <div className="text-sm my-4 gap-1 text-bold ">
            {filteredData.map((noti) => (
              <div className="cursor-pointer gap-x-5 p-4 mb-4 flex justify-between border-b-[1px] border-b-dialogue items-center"
      onClick={()=>{handeClickLogs(noti)}}
              >
                <div>
                  <span className="text-gray-500 mr-6">
                    {formatDate(noti.createdAt)}
                  </span>
                  <span className="font-semibold">
                    {(noti.type !== 9 && noti.type !== 8) ? noti?.fromUser?.name : `You`}
                  </span>{" "}
                  {notiText[noti.type]}{" "}
                  <span className="font-semibold">
                    {noti.type === 9 && `${noti?.linkTo?.name} - ${noti?.note}`}
                  </span>
                  <span className="font-semibold">
                    {(noti.type === 3 || noti.type === 5 || noti.type === 9) &&
                      noti?.linkTo?.text}
                  </span>
                  <span className="font-semibold">
                    {(noti.type === 7 ||noti.type === 8) && Math.abs(noti?.points)} points to {" "}
                  </span>
                  <span className="font-semibold">
                    {(noti.type === 7) &&
                      `you`}
                  </span>
                  <span className="font-semibold">
                    {(noti.type === 8) &&
                      noti?.linkTo?.name}
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
            User has no activity yet
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center">
        <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
      </div>
    );
  }

  return (
    <div className={`w-full p-4 rounded-lg `}>
      <div className="flex justify-between"></div>

      <div className="mb-5">
        <div className="text-2xl text-white serif-display ">Your points</div>

        <div className="flex items-center gap-x-3 my-3">
          <img className="w-[50px]" src="/images/points.png" />
          <div className="serif-display text-3xl ">{user.points} Points</div>
          <AiOutlineInfoCircle className="text-2xl" />
        </div>

        <HeaderMenu list={list} menu={menu} handler={setMenu} />

        {menu === "List" && <VoucherSection />}

        {menu === "My wallet" && <WalletSection />}
      </div>

      <div className="text-2xl text-white serif-display ">History</div>
      <HeaderMenu
        list={historyList}
        menu={historyMenu}
        handler={setHistoryMenu}
      />

      <HistorySection data={logs} menu={historyMenu}/>
    </div>
  );
};

export default Points;
