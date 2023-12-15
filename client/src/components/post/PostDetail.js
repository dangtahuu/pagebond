import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ReactLoading from "react-loading";
// context
import { useAppContext } from "../../context/useContext";
import Post from "../common/Post";

const PostDetail = () => {
  const navigate = useNavigate();
  const { id: postId, type } = useParams();

  useEffect(() => {
    getPost();
  }, []);

  const { autoFetch, user } = useAppContext();
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);
  const getPost = async () => {
    try {
      const { data } = await autoFetch.get(`api/${type}/${postId}`);
      setPost(data.post);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg || "Something went wrong");
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
    <div className="w-screen min-h-screen bg-mainbg  flex justify-center">
      <div className="w-[600px] mt-[60px]">
        <Post
          className=""
          currentPost={post}
          border={false}
        />
      </div>
    </div>
  );
};

export default PostDetail;
