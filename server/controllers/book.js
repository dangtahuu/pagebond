import Book from "../models/book.js";

const searchBook = async (req, res) => {
    const term = req.query.term;
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;
    if (!term.length) {
      return res.status(400).json({ msg: "Search term is required!" });
    }
    
    try {
        const results = await Book.find({ title: { $regex: term, $options: 'i' } })
        .limit(perPage)
        .skip((page - 1) * perPage)

        if (!results) {
          return res.status(400).json({ msg: "No result found!" });
        }

      return res.status(200).json({ books: results, perPage });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ msg: err });
    }
  };


  const getBook = async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ msg: "Book Id is required!" });
    }
    
    try {
        const result = await Book.findById(id)

        if (!result) {
          return res.status(400).json({ msg: "No book found!" });
        }

      return res.status(200).json({ book: result });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ msg: err });
    }
  };

  export {searchBook, getBook}