import { useAppContext } from "../../context/useContext";
import { useNavigate } from "react-router-dom";
import News from "./components/News";
import Main from "./components/Main";
import Suggestion from "./components/Suggestion";
import BookSuggestion from "./components/BookSuggestion";
import ChatBotBanner from "./components/ChatBotBanner";
import Hashtag from "./components/Hashtags";

const Dashboard = () => {
  const navigate = useNavigate();
  const { autoFetch, user, token, setNameAndToken, setOneState } =
    useAppContext();

  return (
    <div className="min-h-screen bg-mainbg overflow-clip pt-[70px] ">
      <div className="w-screen grid grid-cols-11 md:gap-x-8 px-3 sm:px-7 md:px-10 relative ">
        <div className="hidden lg:block lg:col-span-3 lg:order-1">

            <div>
            <News
              className=""
              autoFetch={autoFetch}
              token={token}
              name="News"
              url="api/special/admin"
            />
            </div>

            <div className="sticky top-[60px] mt-3">
              <News
                autoFetch={autoFetch}
                token={token}
                name="From verified accounts"
                url="api/special/official"
              />
            </div>
        </div>
        <div className="col-span-11 order-2 md:col-span-7 lg:col-span-5 shrink-0 md:order-1 lg:order-2 ">
          <Main
            autoFetch={autoFetch}
            setOneState={setOneState}
            token={token}
            user={user}
          />
        </div>
        <div className="col-span-11 order-1 md:col-span-4 lg:col-span-3 md:order-2 lg:order-3 ">
          <ChatBotBanner/>

          <Hashtag
            autoFetch={autoFetch}
            navigate={navigate}
            setNameAndToken={setNameAndToken}
            user={user}
            token={token}
          />

          <Suggestion
            autoFetch={autoFetch}
            navigate={navigate}
            setNameAndToken={setNameAndToken}
            user={user}
            token={token}
          />
          <BookSuggestion
            autoFetch={autoFetch}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
