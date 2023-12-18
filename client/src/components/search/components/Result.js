import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppContext } from "../../../context/useContext";
import { TiTick } from "react-icons/ti";
import ReactLoading from "react-loading";
import UserCard from "../../common/UserCard";
import Post from "../../../components/common/Post"

const Result = ({ text, setText, searchType, hasSearched, setHasSearched, results, setResults }) => {
  const { autoFetch } = useAppContext();

  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParam = JSON.parse(decodeURIComponent(searchParams.get("q")))
  const google = searchParams.get("google") || false;

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const [hasMoreData, setHasMoreData] = useState(true);

  const list = [
    { display: "Books", value: "book" },
    { display: "Users", value: "auth" },
    { display: "Posts", value: "post" },
    { display: "Reviews", value: "review" },
    { display: "Questions", value: "question" },
    { display: "News", value: "special" },
    { display: "Tradings", value: "trade" },
  ];

  useEffect(() => {
    if (queryParam) {

      handleSearch();
    }
  }, [queryParam, google, searchType]);

  useEffect(() => {
    console.log(page);
  }, [page]);

  const handleSearch = async () => {
    console.log('aaaaaa')
    setLoading(true);

    try {
      if (!google) {
        const { data } = await autoFetch.get(
          `/api/${searchType}/search/?term=${encodeURIComponent(
            JSON.stringify(queryParam)
          )}`
        );
        if (data.results.length < 10) {
          setHasMoreData(false);
        } else {
          setHasMoreData(true);
        }
        setResults(data.results);
        console.log(data);
      } else {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            JSON.stringify(queryParam)
          )}`
        );
        const res = await response.json();
        // Add the items to array_2
        setResults(res.items);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setText("");
      setHasSearched(true);
    }
  };

  const loadMore = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(
        `/api/${searchType}/search/?term=${queryParam}&page=${page + 1}`
      );
      if (data.results.length < 10) {
        setHasMoreData(false);
      } else {
        setHasMoreData(true);
      }
      setResults((prev) => [...prev, ...data.results]);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setText("");
    }
  };

  const handleGoogleResult = async (book) => {
    try {
      const { data } = await autoFetch.post(`/api/book/handle-google`, {
        book,
      });
      navigate(`/book/${data.book[0]._id}`);
      console.log(data.book[0]._id);
    } catch (e) {
      console.log(e);
    }
  };

  const BlankScreen = () => {
    return (
      <>
        <img
          class="w-[35%] m-auto block"
          src="/images/search-screen.png"
          alt=""
        />
        {hasSearched && (
          <div class="w-full m-auto block mt-10 text-center">
            Sorry we didn't find anything with the keyword "{queryParam}"
          </div>
        )}
      </>
    );
  };

  useEffect(() => {
    console.log(results);
  }, [results]);

  const BookResult = () => {
    if (loading)
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    if (results?.length === 0) return <BlankScreen />;
    return (
      <div>
        <div className="font-bold text-xl mb-3">
          Showing results for "{queryParam}"
        </div>
        <div className="md:grid md:grid-cols-2 gap-x-5">
          {results.map((a) => {
            return (
              // @ts-ignore

              <div
                className="flex h-auto items-center mb-3 bg-dialogue text-mainText rounded-lg shadow flex-row w-full"
                key={a._id}
                onClick={() => navigate(`/book/${a._id}`)}
              >
                <img
                  className="object-cover cursor-pointer w-full h-full rounded-t-lg md:w-20 md:rounded-none md:rounded-l-lg"
                  src={
                    a.thumbnail || "https://sciendo.com/product-not-found.png"
                  }
                  alt=""
                />
                <div className="flex flex-col justify-between p-2 leading-normal">
                  <p className="mb-1 text-lg font-semibold cursor-pointer">
                    {a.title}
                  </p>
                  <p className="mb-1 text-base text-smallText cursor-pointer">
                    {a.author}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {hasMoreData && (
          <button
            // type="submit"
            class="primary-btn m-auto w-[140px] mt-5"
            onClick={loadMore}
          >
            Load more
          </button>
        )}
        {!google && (
          <div
            class="mt-3 font-bold cursor-pointer"
            onClick={() => {
              navigate(`/search/?q=${queryParam}&google=true`);
            }}
          >
            Try searching with Google Books?
          </div>
        )}
      </div>
    );
  };

  const GoogleBookResult = () => {
    if (loading)
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    if (results.length === 0) return <BlankScreen />;
    return (
      <div>
        <div className="font-bold text-xl mb-3">
          Showing Google book results for "{queryParam}"
        </div>
        <div className="md:grid md:grid-cols-2 gap-x-5">
          {results.map((a) => {
            return (
              // @ts-ignore

              <div
                className="flex h-auto items-center mb-3 bg-dialogue text-mainText rounded-lg shadow flex-row w-full"
                key={a._id}
                onClick={() => {
                  handleGoogleResult(a);
                }}
              >
                <img
                  className="object-cover cursor-pointer w-full h-full rounded-t-lg md:w-20 md:rounded-none md:rounded-l-lg"
                  src={
                    a.volumeInfo?.imageLinks?.thumbnail ||
                    "https://sciendo.com/product-not-found.png"
                  }
                  alt=""
                />
                <div className="flex flex-col justify-between p-2 leading-normal">
                  <p className="mb-1 text-lg font-semibold cursor-pointer">
                    {a.volumeInfo?.title || "Unknown"}
                  </p>
                  <p className="mb-1 text-base text-smallText cursor-pointer">
                    {a.volumeInfo?.authors?.[0] || "Unknown"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const UserResult = () => {
    if (loading)
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    if (results.length === 0) return <BlankScreen />;
    return (
      <div>
        <div className="font-bold text-xl mb-3">
          Showing results for "{queryParam}"
        </div>
        <div className="md:grid md:grid-cols-5 gap-x-2">
          {results.map((a) => {
            return (
              // @ts-ignore

              <UserCard person={a} />
            );
          })}
        </div>

        {hasMoreData && (
          <button
            // type="submit"
            class="primary-btn m-auto w-[140px] mt-5"
            onClick={loadMore}
          >
            Load more
          </button>
        )}
      </div>
    );
  };

  const PostResult = () => {
    if (loading)
      return (
        <div className="w-full flex justify-center">
          <ReactLoading type="spin" width={30} height={30} color="#7d838c" />
        </div>
      );
    if (results.length === 0) return <BlankScreen />;
    return (
      <div className="">
        <div className="font-bold text-xl mb-3">
          Showing results for "{queryParam}"
        </div>
        <div className="w-full flex justify-center">
        <div className="w-[600px]">
          {results.map((a) => {
            return (
            <Post currentPost={a} key={a?._id} />
            );
          })}
        </div>
        </div>
      

        {hasMoreData && (
          <button
            // type="submit"
            class="primary-btn m-auto w-[140px] mt-5"
            onClick={loadMore}
          >
            Load more
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="flex mx-0 sm:mx-10 mb-5">
        <ul className="flex items-center justify-start w-auto py-1 gap-x-5">
          {list.map((v) => (
            <li
              key={v.value}
              className={`li-profile ${searchType === v.value && "active"} `}
              onClick={() => {

                if (queryParam)
                  navigate(`/search/?q=${encodeURIComponent(
                    JSON.stringify(queryParam)
                  )}&searchType=${v.value}`);
                else navigate(`/search/?searchType=${v.value}`);
              }}
            >
              {v.display}
            </li>
          ))}
        </ul>
      </div>
    
      {searchType === "book" && !google && <BookResult />}
      {searchType === "book" && google && <GoogleBookResult />}
      {searchType === "auth" && <UserResult />}
      {searchType !== "book" &&searchType !== "auth" && <PostResult />}

    </div>
  );
};

export default Result;
