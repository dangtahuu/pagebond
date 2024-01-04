import { useRef } from "react";
import useOnClickOutside from "../../../hooks/useOnClickOutside";

const FilterBox = ({
  setFilterBox,
  getPosts,
  filterRef,
  setFilter,
  filter,
  setSort,
  sort,
  filterList,
  sortList,
}) => {

  const handleFilter = (sort, filter) => {
    getPosts(sort, filter);
  };

  return (
    <div
      ref={filterRef}
      className="absolute p-3 z-[150] rounded-lg right-0 top-[32px] w-[400px] bg-dialogue"
    >
      {sortList && (
        <>
          <div className="text-sm font-bold mb-2">Sort reviews</div>
          <div>
            {Object.keys(sortList).map((one) => (
              <div
                onClick={() => {
                  setSort(sortList[one]);
                  console.log(sortList[one])
                  handleFilter(sortList[one], filter);
                }}
                key={sortList[one]}
                className={`pill my-1 mr-1 ${
                  sort === sortList[one] ? "bg-greenBtn" : "bg-mainbg"
                } `}
              >
                {one}
              </div>
            ))}
          </div>
        </>
      )}

      {filterList && (
        <>
          <div className="text-sm font-bold my-2">Filter by rating</div>
          <div>
            {filterList.map((one) => (
              <div
                onClick={() => {
                  setFilter(one);
                  handleFilter(sort, one);
                }}
                key={one}
                className={`pill w-[50px] my-1 mr-1 ${
                  filter === one ? "bg-greenBtn" : "bg-mainbg"
                } `}
              >
                {one}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterBox