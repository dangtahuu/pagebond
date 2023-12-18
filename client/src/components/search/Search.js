import React from "react";
import { useAppContext } from "../../context/useContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import { useLocation } from "react-router-dom";
import Browse from "./components/Browse";
import { IoIosArrowBack } from "react-icons/io";
import Result from "./components/Result";

function Search() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { autoFetch} = useAppContext();
 

  const [text, setText] = useState("")

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const searchType = searchParams.get('searchType') || "book"
  const isSearch = location.pathname.includes('/search')
 
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);

  return (
    <div
      className={`md:flex w-screen bg-mainbg min-h-screen pt-[65px] px-[3%] sm:px-[5%] md:px-[10%]`}
    >
      {/* <div className="w-full h-[90%] mt-[3%] pt-3 bg-white  rounded-lg items-start justify-center py-16 px-4 overflow-y-auto"> */}
      <div className="w-full mt-[3%] pt-3 items-start justify-center py-16 px-4">
       
        <div class="relative mt-4">
        {isSearch && (<div className="flex items-center gap-x-2 absolute -top-[40px] cursor-pointer"
        onClick={()=>{
          setText("")
          navigate('/browse') }}>
          <IoIosArrowBack className="text-xl"/>
          Back to Browse
        </div>)}
          <div class="absolute inset-y-0 left-4 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            // type="text"
            id="default-search"
            class="block w-full p-4 pl-12 ps-10 text-sm text-gray-900  focus:ring-black rounded-full bg-gray-50 "
            placeholder="Search something"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onClick={()=>{
              setHasSearched(false)
              setResults([])
              navigate(`/search/?searchType=${searchType}`)}}
          />
          <button
            class="text-white absolute right-4 end-2.5 bottom-2.5 bg-black hover:bg-gray-700 focus:outline-none font-medium rounded-full text-sm px-4 py-2"
            onClick={()=>{
              navigate(`/search?q=${encodeURIComponent(
                JSON.stringify(text)
              )}&searchType=${searchType}`)}}
          >
            Search
          </button>
        </div>
       {!isSearch ? <Browse/>: <Result text={text} setText={setText} searchType={searchType}
       hasSearched={hasSearched} setHasSearched={setHasSearched} results={results} setResults={setResults}
       /> }
      </div>
    </div>
  );
}

export default Search;
