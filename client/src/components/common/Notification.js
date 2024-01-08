import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";
import { AiOutlineCheck } from "react-icons/ai";

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
            navigate(`/detail/${data.linkTo._id}`);
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

    const NotiText = () => {
      console.log(data);
      switch (data?.type?.name) {
        case "comment":
          return (
            <>
              <span>has commented on your post</span>{" "}
              <div className="text-smallText">
                {noti?.linkTo?.text.slice(0, 20)}
              </div>
            </>
          );
        case "follow":
          return (
            <>
              <span>started following you</span>{" "}
            </>
          );
        case "gifted":
          return (
            <>
              <span>has gifted you</span>
              <span>{noti?.points}</span>
            </>
          );
        default:
          return <></>;
      }
    };

    return (
      <div
        className={`${
          noti.isDone ? `` : `bg-mainbg`
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
            <NotiText />
          </div>
        </div>
        {!noti.isDone && (
          <div className="rounded-full bg-greenBtn w-[10px] h-[10px]"></div>
        )}
      </div>
    );
  };

  const handleMarkAll = async (id) => {
    try {
      setPage(1);
      setHasMoreNotifications(true);
      setNotiMenu(false);
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
