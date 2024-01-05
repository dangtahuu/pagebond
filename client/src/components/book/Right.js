import { Rating } from "@mui/material";
import Chart from "./components/Chart";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/useContext";
import { useNavigate } from "react-router-dom";
import PeopleModal from "../common/PeopleModal";

const Right = ({ book, openUpNext, setOpenUpNext}) => {
  const { autoFetch, setOneState } = useAppContext();
  const navigate = useNavigate();
  const [chart, setChart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [upNextPeople, setUpNextPeople] = useState([]);


  useEffect(() => {
    getChart();
    getFavorites();
    getUpNext();
  }, [book]);

  const getChart = async () => {
    try {
      const { data } = await autoFetch.get(
        `/api/review/book-chart/${book?.id}`
      );
      setChart(data.result);
    } catch (error) {
      console.log(error);
    }
  };

  const getFavorites = async () => {
    try {
      const { data } = await autoFetch.get(`/api/shelf/favorites/${book?.id}`);
      setFavorites(data.shelves);
    } catch (error) {
      console.log(error);
    }
  };

  const getUpNext = async () => {
    try {
      const { data } = await autoFetch.get(
        `/api/shelf/up-next-people/${book?.id}`
      );
      setUpNextPeople(data.people);
    } catch (error) {
      console.log(error);
    }
  };

  const RatingDisplay = ({ value, label }) => {
    return (
      <div className="inline-flex">
        <p className="mr-3 w-[100px]">{label}</p>
        <Rating
          className="!text-md flex-1"
          value={value}
          precision={0.1}
          readOnly
        />
        <p className="ml-3">{value}</p>
      </div>
    );
  };

  return (
    <>
      {openUpNext && (
        <PeopleModal setOpenModal={setOpenUpNext} people={upNextPeople} />
      )}
      {book.numberOfRating > 0 ? (
        <div className="flex flex-col gap-y-2">
          <div className="flex items-end py-2 border-b-[1px] border-dialogue ">
            <div className="flex flex-col flex-1">
              <div className="text-4xl font-semibold serif-display text-white">
                {book.rating}
              </div>
              <div className="text-smallText text-base">
                {book.numberOfRating} reviews
              </div>
              <Rating
                className="!text-3xl"
                value={book.rating}
                precision={0.1}
                readOnly
              />
            </div>
            <div className="flex-0 border-smallText border-b-[1px]">
              <Chart data={chart} />
            </div>
          </div>
          <div>
            This book has a <span className="font-semibold">{book.pacing}</span>{" "}
            pacing
          </div>
          <RatingDisplay value={book.content} label="Content" />
          <RatingDisplay value={book.developement} label="Development" />
          <RatingDisplay value={book.writing} label="Writing" />
          <RatingDisplay value={book.insights} label="Insights" />
        </div>
      ) : (
        <div className="serif-display mb-2">
          This book hasn't received any rating
        </div>
      )}

      {book.genres && (
        <div className="mt-3">
          <div className="serif-display mb-2">Genres</div>

          {book.genres.map((genre) => (
            <div
              className="cursor-pointer text-xs inline-block pb-1 border-b-2 border-b-dialogue my-1 mr-3"
              onClick={() => {
                navigate(
                  `/browse/?genre=${encodeURIComponent(JSON.stringify(genre))}`
                );
              }}
            >
              {genre}
            </div>
          ))}
        </div>
      )}

      {book.topShelves?.length > 0 && (
        <div className="mt-3">
          <div className="serif-display mb-2">Top Shelves</div>

          {book.topShelves.map((shelf) => (
            <div
              className="cursor-pointer text-xs inline-block rounded-full bg-dialogue px-2 py-1 my-1 mr-1"
              onClick={() => {
                navigate(
                  `/browse/?genre=${encodeURIComponent(JSON.stringify(shelf))}`
                );
              }}
            >
              {shelf}
            </div>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="mt-3 flex items-center gap-x-3 px-2">
          <div class="flex -space-x-3 rtl:space-x-reverse w-[100px]">
            {favorites.slice(0, 4).map((one) => (
              <img
                class="w-8 h-8 border-2 border-white rounded-full"
                src={one.owner.image.url}
                alt=""
              />
            ))}
          </div>
          <div className="text-sm">
            {favorites.length} people love this book
          </div>
        </div>
      )}

      {upNextPeople.length > 0 && (
        <div
          className="mt-3 flex items-center gap-x-3 cursor-pointer hover:bg-altDialogue px-2 py-1 rounded-lg"
          onClick={() => setOpenUpNext(true)}
        >
          <div class="flex -space-x-3 rtl:space-x-reverse w-[100px]">
            {upNextPeople.slice(0, 4).map((one) => (
              <img
                class="w-8 h-8 border-2 border-white rounded-full"
                src={one.image.url}
                alt=""
              />
            ))}
          </div>
          <div className="text-sm">
            {upNextPeople.length} people for <span className="font-semibold">Up Next</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Right;
