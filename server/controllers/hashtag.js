import Hashtag from "../models/hashtag.js";

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

  export {search}