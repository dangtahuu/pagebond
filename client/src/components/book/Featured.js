import { useEffect, useState } from "react";
import { useAppContext } from "../../context/useContext";
import { LuBadgeCheck } from "react-icons/lu";
import Post from "../common/Post";

const Featured = ({bookId})=> {
    const { autoFetch } = useAppContext();

    const [featured, setFeatured] = useState("")
    useEffect(()=>{
        getFeatured()
    },[bookId])

    const getFeatured = async () => {
        try {
          const { data } = await autoFetch.get(`/api/news/book-featured/${bookId}`);
          setFeatured(data.post);
        } catch (error) {
          console.log(error);
        }
      };

      if(!featured) {
        return (<></>)
      }

      return (

        <div className="my-4 border-b-[1px] border-b-dialogue">
          <div className="flex items-center gap-x-2 mb-2">
            <LuBadgeCheck className="text-2xl text-greenBtn" />
            <div className="serif-display text-2xl">Featured</div>
          </div>
          <Post currentPost={featured} book={bookId} />
        </div>
      );
}

export default Featured