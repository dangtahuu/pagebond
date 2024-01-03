import Hashtag from "../models/hashtag.js";
import Review from "../models/review.js";
import Trade from "../models/trade.js";
import News from "../models/news.js";
import Question from "../models/question.js";
import Post from "../models/post.js";


const search = async (req, res) => {
    const term = req.query.term;
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;
  
    if (!term.length) {
      return res.status(400).json({ msg: "Search term is required!" });
    }
  
    try {
      const hashtags = await Hashtag.find(
        { name: { $regex: term, $options: "i" } },
      )
        .limit(perPage)
        .skip((page - 1) * perPage);
  
      return res.status(200).json({ hashtags });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const getTrending = async (req, res) => {
    const today = new Date();
    const daysAgo = new Date(today);
    daysAgo.setDate(today.getDate() - 1);

    try {
      const posts = await Post.find({createdAt: {$gte: daysAgo}})
  
      const hashtagsCount = {};

      posts.forEach((post) => {
        post.hashtag.forEach((tag)=>{
          hashtagsCount[tag] = (hashtagsCount[tag] || 0) + 1;
        }) 
      });

      let sortedTags = Object.keys(hashtagsCount).sort(
        (a, b) => hashtagsCount[b] - hashtagsCount[a]
      );

      sortedTags.slice(0,6)

      const hashtags = await Hashtag.find({_id: {$in: sortedTags}})

      return res.status(200).json({ hashtags });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };


  export {search, getTrending}