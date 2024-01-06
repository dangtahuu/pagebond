import React, { useEffect, useState } from "react";
import { ModalShelf } from "../..";
import { FiFolderPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { Rating } from "@mui/material";
import ReactLoading from "react-loading";
import { formatDate } from "../../../utils/formatDate";
import { useLocation } from "react-router-dom";
import Post from "../../common/Post";
import { GrPrevious, GrNext } from "react-icons/gr";

const Diary = ({ userId, autoFetch, navigate }) => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState("");

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const year = searchParams.get("year") || currentYear;

  useEffect(() => {
    getDiary();
  }, [userId, year]);

  const getDiary = async () => {
    setLoading(true);
    try {
      const { data } = await autoFetch.get(`/api/post/stats/${userId}/${year}`);
      setEntries(data.posts);
      setStats(data.stats);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
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
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl text-white serif-display ">
            {year === "all" ? "All time statistics" : `${year} statistics`}
          </div>
          <div className="flex items-center gap-x-2">
            {(year !== "all") &&
            (

              <>
                <button
                  className="primary-btn bg-black"
                  onClick={() => {
                    navigate(`/profile/${userId}?view=diary&year=${year - 1}`);
                  }}
                >
                  <GrPrevious className=" " />
                </button>

                {year !== currentYear &&
                  <button
                  className="primary-btn bg-black"
                  onClick={() => {
                    navigate(`/profile/${userId}?view=diary&year=${year + 1}`);
                  }}
                >
                  <GrNext className=" " />
                </button>}
              

                <button
                  className="primary-btn bg-black"
                  onClick={() => {
                    navigate(`/profile/${userId}?view=diary&year=all`);
                  }}
                >
                  All time
                </button>
              </>
            )}

            {year === "all" && (
              <button
                className="primary-btn bg-black"
                onClick={() => {
                  navigate(`/profile/${userId}?view=diary&year=${currentYear}`);
                }}
              >
                Year view
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center w-full justify-center">
          <div className="serif-display text-3xl flex flex-col items-center justify-center">
            <div>{stats?.booksCount}</div>
            <div>Books</div>
          </div>
          <img className="w-[50%]" src="/images/diary.png" />
          <div className="serif-display text-3xl flex flex-col items-center justify-center">
            <div>{stats?.pageCount}</div>
            <div>Pages</div>
            <div className="text-sm text-smallText mt-2">
              {stats?.averagePage} pages on average
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 w-full">
          <div className="col-span-1">
            <div className="mb-2 serif-display text-xl">Highest rated</div>
            <div className="flex h-auto relative flex-col items-center mb-3 md:flex-row w-full">
              <img
                className="cursor-pointer h-[150px] w-[100px] rounded-lg"
                src={
                  stats?.highestRatedBook?.thumbnail ||
                  "https://sciendo.com/product-not-found.png"
                }
                alt=""
                onClick={() =>
                  navigate(`/book/${stats?.highestRatedBook?._id}`)
                }
              />

              <div className="flex flex-col max-w-[200px] gap-y-2 justify-between p-2 leading-normal">
                <p
                  className="text-sm cursor-pointer font-semibold"
                  onClick={() =>
                    navigate(`/book/${stats?.highestRatedBook?._id}`)
                  }
                >
                  {stats?.highestRatedBook?.title.slice(0, 50)}
                </p>
                <p className="text-sm">{stats?.highestRatedBook?.author}</p>

                {stats?.highestRatedBook?.rating && (
                  <div className="">
                    <div className="flex gap-x-2 items-center">
                      <Rating
                        className="!text-sm"
                        value={stats?.highestRatedBook?.rating}
                        precision={0.1}
                        readOnly
                      />
                      <div className="text-sm font-semibold">
                        {stats?.highestRatedBook?.rating}
                      </div>
                    </div>

                    <div className="text-xs">
                      {stats?.highestRatedBook?.numberOfRating} ratings
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="mb-2 serif-display text-xl">Most popular</div>
            <div className="flex h-auto relative flex-col items-center mb-3 md:flex-row w-full">
              <img
                className="cursor-pointer h-[150px] w-[100px] rounded-lg"
                src={
                  stats?.mostPopularBook?.thumbnail ||
                  "https://sciendo.com/product-not-found.png"
                }
                alt=""
                onClick={() => navigate(`/book/${stats?.mostPopularBook?._id}`)}
              />

              <div className="flex flex-col max-w-[200px] gap-y-2 justify-between p-2 leading-normal">
                <p
                  className="text-sm cursor-pointer font-semibold"
                  onClick={() =>
                    navigate(`/book/${stats?.mostPopularBook?._id}`)
                  }
                >
                  {stats?.mostPopularBook?.title.slice(0, 50)}
                </p>
                <p className="text-sm">{stats?.mostPopularBook?.author}</p>

                {stats?.mostPopularBook?.rating && (
                  <div className="">
                    <div className="flex gap-x-2 items-center">
                      <Rating
                        className="!text-sm"
                        value={stats?.mostPopularBook?.rating}
                        precision={0.1}
                        readOnly
                      />
                      <div className="text-sm font-semibold">
                        {stats?.mostPopularBook?.rating}
                      </div>
                    </div>

                    <div className="text-xs">
                      {stats?.mostPopularBook?.numberOfRating} ratings
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="my-3">
          <div className="mb-2 serif-display text-xl">Your top 5 genres</div>
          <div className="grid grid-cols-5 gap-x-3">
            {stats?.mostGenres?.map((one) => (
              <div className="rounded-full h-[120px] w-[120px] bg-dialogue p-4 flex flex-col justify-center items-center">
                <div className="text-center font-semibold">{one.value}</div>
                <div>{one.count} books</div>
              </div>
            ))}
          </div>
        </div>

        <div className="my-3">
          <div className="my-2 serif-display text-xl">Your top 5 moods</div>
          <div className="grid grid-cols-5 gap-x-3">
            {stats?.mostMoods?.map((one) => (
              <div className="rounded-full h-[120px] w-[120px] bg-dialogue p-4 flex flex-col justify-center items-center">
                <div className="text-center font-semibold">{one.value}</div>
                <div>{one.count} books</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 serif-display text-xl">Your most liked post</div>
          <div className="w-[500px] mx-auto">
            <Post currentPost={stats.mostLikedPost} />
          </div>
        </div>

        <div>
          <div className="text-2xl text-white serif-display ">Diary</div>

          {entries.length > 0 ? (
            <div className="text-sm my-4 gap-1 text-bold ">
              <div className="grid grid-cols-9 gap-x-5 h-auto p-4 mb-4 bg-altDialogue rounded-lg items-center">
                <div className="col-span-1">Read on</div>
                {/* <div className="col-span-1"> </div> */}
                <div className="col-span-2 flex gap-x-2">Book</div>
                <div className="col-span-1">Pages</div>

                <div className="col-span-2">Publisher</div>
                <div className="col-span-1">Year</div>
                <div className="col-span-1">Rating</div>
                <div className="col-span-1 flex justify-end">
                  {/* <button className="">View</button> */}
                </div>
              </div>
              {entries.map((one) => (
                <div className="grid grid-cols-9 gap-x-5 p-4 mb-4 border-b-[1px] border-b-dialogue items-center">
                  <div className="col-span-1">
                    {formatDate(one?.detail?.dateRead)}
                  </div>
                  {/* <div className="col-span-1"> </div> */}
                  <div
                    className="col-span-2 flex gap-x-2 cursor-pointer"
                    onClick={() => {
                      navigate(`/book/${one?.book?._id}`);
                    }}
                  >
                    <img
                      className="rounded-lg w-[50px]"
                      src={one?.book?.thumbnail}
                    />
                    <div className="flex flex-col justify-center">
                      <div>{one?.book?.title}</div>
                      <div>{one?.book?.author}</div>
                    </div>
                  </div>
                  <div className="col-span-1">{one?.book?.pageCount} pages</div>

                  <div className="col-span-2">{one?.book?.publisher}</div>
                  <div className="col-span-1">{one?.book?.publishedDate}</div>
                  <div className="col-span-1">
                    {" "}
                    <Rating
                      className="!text-sm"
                      // name="half-rating-read"
                      value={one?.detail?.rating}
                      precision={0.5}
                      readOnly
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      className="cursor-pointer bg-greenBtn rounded-full w-auto py-1 px-2"
                      onClick={() => {
                        navigate(`/book/${one.book?._id}`);
                      }}
                    >
                      View
                    </button>
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
      </div>
    </div>
  );
};

export default Diary;
