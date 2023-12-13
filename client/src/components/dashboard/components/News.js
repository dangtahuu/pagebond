import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

const News = ({ autoFetch, name = "", url = ""}) => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
      getList();
  }, []);

  const getList = async () => {
    try {
      const { data } = await autoFetch.get(url);
      setList(data.posts);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const Content = () => {
    if (loading) {
      
      return <div className="w-full flex justify-center"><ReactLoading type="spin" width={30} height={30} color="#7d838c" /></div>
    } else {
      if (list.length) {
        return (
          <>
            <div className="w-full">
              {list.map((a) => {
                return (

                  <div
                    className="w-full bg-dialogue cursor-pointer rounded-lg mt-4"
                    key={a._id}
                    onClick={() => navigate(`/post/information/${a._id}`)}
                  >
                    <img
                      className="rounded-t-lg max-h-32 w-full object-cover"
                      src={a.image?.url}
                      alt=""
                    />

                    <div className="p-2">
                        <h5 className="mb-2 text-base serif-display">
                          {a.title}
                        </h5>
                      {a.type===2 &&
                        <h5 className="mb-2 text-sm">
                          by <span className="font-semibold">{a.postedBy.name}</span>
                        </h5>
                      }
                     
                      <button className="primary-btn">Read</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      }
    }
    return <div>No posts available</div>;
  };

  return (
    <>
      <div className="flex w-full serif-display text-lg items-center justify-between mb-3">
        {name}
      </div>
      <Content />
    </>
  );
};

export default News;
