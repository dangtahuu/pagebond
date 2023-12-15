import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";
import { AiOutlineCheck } from "react-icons/ai";

const notiText = {
  1: "has followed you",
  3: "has liked your post",
  5: "has commented on your post",
  7: "has sent you",
  8: "has verified your account",
  9: "has veried your post",
};

const Notification = ({
  notificationsLoading,
  getNotifications,
  notifications,
  setNotiMenu,
  autoFetch,
  navigate,
  setPage,
  getMoreNotifications,
  hasMoreNotifications,
  setHasMoreNotifications,
}) => {
  
  const Card = ({ data }) => {
    const [noti, setNoti] = useState(data);

    const handeClick = async (id) => {
      try {
        setPage(1);
        setHasMoreNotifications(true);
        setNotiMenu(false);
        switch (data.typeOfLink) {
          case "User":
            navigate(`/profile/${data.fromUser._id}`);
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
          case "Special":
            navigate(`/detail/special/${data.linkTo._id}`);
            break;
          default:
            break;
        }
        await autoFetch.patch("api/log/noti/mark-read", {
          id,
        });
        await getNotifications();
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.msg || "Something went wrong");
      }
    };

    return (
      <div
        className={`${
          noti.isRead ? `` : `bg-mainbg`
        } hover:bg-altDialogue transition-20 cursor-pointer rounded-lg flex justify-between items-center w-full p-2 text-sm mb-2`}
        onClick={() => {
          handeClick(noti._id);
        }}
      >
        <div className="flex items-center gap-x-2">
          <img
            src={noti.fromUser?.image?.url || `/images/avatar.png`}
            className="rounded-full h-8 w-8"
          />
          <div>
            <span className="font-semibold">{noti?.fromUser?.name}</span>{" "}
            {notiText[noti.type]}{" "}
            <span className="font-semibold">
              {noti.type === 7 && noti.points}
            </span>
            <div className="text-smallText">
              {(noti.type === 3 || noti.type === 5 || noti.type === 9) &&
                noti.linkTo.text}
            </div>
          </div>
        </div>
        {!noti.isRead && (
          <div className="rounded-full bg-greenBtn w-[10px] h-[10px]"></div>
        )}
      </div>
    );
  };

  const handleMarkAll = async (id) => {
    try {
      setPage(1);
      setHasMoreNotifications(true);
     setNotiMenu(false)
      await autoFetch.patch("api/log/noti/mark-read-all");
      await getNotifications();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
    }
  };

  return (
    <div id="scrollableDiv" className="max-h-[80vh] overflow-auto style-3 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xl serif-display ">Notifications</div>
        <div className="text-xl cursor-pointer" onClick={handleMarkAll}>
          <AiOutlineCheck />
        </div>
      </div>

      {!notificationsLoading && (
        <InfiniteScroll
          dataLength={notifications.length}
          next={getMoreNotifications}
          hasMore={hasMoreNotifications}
          scrollableTarget="scrollableDiv"
        >
          {notifications?.map((noti) => (
            <Card key={noti._id} data={noti} autoFetch={autoFetch} />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Notification;
