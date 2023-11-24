import { React, useState, useEffect } from "react";
import { useAppContext } from "../../context/useContext";
import { LoadingProfile } from "..";
import { useNavigate } from "react-router-dom";
import "react-multi-carousel/lib/styles.css";
import CarouselComponent from "./components/CarouselComponent";
import CarouselNear from "./components/CarouselNear";
import ReactLoading from "react-loading";

function Browse() {

  const {
    autoFetch,
    dark,
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [fantasy, setFantasy] = useState([]);
  const [selfHelp, setSelfHelp] = useState([]);
  const [poetry, setPoetry] = useState([]);
  const [hisFic, setHisFic] = useState([]);
  const [classics, setClassics] = useState([]);
  const [business, setBusiness] = useState([]);
  const [comics, setComics] = useState([]);

  useEffect(() => {
    getBooks();
   
  }, []);

  const getBooks = async () => {
  
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async(position) => {
          const { data } = await autoFetch.get(
            `/api/post/get-nearby/${position.coords.longitude}/${position.coords.latitude}/20`
          );
          // console.log(data.results)
          setList(data.results);
        });
      }
     

      const fantasyRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:fantasy&startIndex=0&maxResults=10&orderBy=newest`
      );
      const fantasyJs = await fantasyRes.json();

      setFantasy(fantasyJs.items);

      const selfHelpRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:self-help&startIndex=0&maxResults=10&orderBy=newest`
      );
      const selfHelpJs = await selfHelpRes.json();

      setSelfHelp(selfHelpJs.items);

      const poetryRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:poetry&startIndex=0&maxResults=10&orderBy=newest`
      );
      const poetryJs = await poetryRes.json();

      setPoetry(poetryJs.items);

      const hisficRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:historical+fiction&startIndex=0&maxResults=10&orderBy=newest`
      );
      const hisficJs = await hisficRes.json();

      setHisFic(hisficJs.items);

      const classicsRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:classics&startIndex=0&maxResults=10&orderBy=newest`
      );
      const classicsJs = await classicsRes.json();

      setClassics(classicsJs.items);

      const businessRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:business&startIndex=0&maxResults=10&orderBy=newest`
      );
      const businessJs = await businessRes.json();

      setBusiness(businessJs.items);

      const comicsRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:comics&startIndex=0&maxResults=10&orderBy=newest`
      );
      const comicsJs = await comicsRes.json();

      setComics(comicsJs.items);


    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="h-screen w-screen fixed flex justify-center items-center	">
       <ReactLoading
                            type='spin'
                            width={50}
                            height={50}
                            color='#7d838c'
                        />
    </div>
  );

  return (
    <div
      className={`md:flex fixed w-screen h-screen bg-[#F0F2F5] dark:bg-black dark:text-white pt-[65px] px-[3%] sm:px-[5%] md:px-[10%]`}
    >
      <div
        className={`w-full h-[90%] mt-[3%] pt-3 bg-white  rounded-lg overflow-y-auto scroll-bar relative  ${
          !dark ? "shadow-post" : ""
        } `}
      >
       <CarouselNear name="Near you" books={list} />

       <CarouselComponent name="Classics" books={classics} />
       <CarouselComponent name="Self-help" books={selfHelp} />
       <CarouselComponent name="Historical Fiction" books={hisFic} />
       <CarouselComponent name="Business" books={business} />
       <CarouselComponent name="Fantasy" books={fantasy} />
       <CarouselComponent name="Poetry" books={poetry} />
       <CarouselComponent name="Comics"books={comics} />
       



      </div>
    </div>
  );
}

export default Browse;
