


const notiText = {
    1: "has followed you",
    3: "has liked your post",
    5: "has commented on your post",
    7: "has sent you",
    8: "has verified your account",
    9: "has veried your post",
  };

const Notification = ({notificationsLoading, notifications}) => {
    return( <div className="max-h-[80vh] overflow-auto style-3">
        <div className="text-sm font-bold mb-2">Notifications</div>
    
        {!notificationsLoading &&
          notifications?.map((noti) => (
            <div
              className="text-sm flex justify-between items-center border-b-[1px] p-2 border-b-smallText"
              // onClick={()=>handleClickNotification(noti)}
            >
              <div>
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
              {!noti.isRead && (
                <div className="rounded-full bg-greenBtn w-[10px] h-[10px]"></div>
              )}
            </div>
          ))}
      </div>)
 
};

export default Notification;
