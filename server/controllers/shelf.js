import Shelf from "../models/shelf.js";

const createShelf = async (req, res) => {
    const { name } = req.body;
  
    if (!name.length) {
      return res.status(400).json({ msg: "Name is required!" });
    }
    
    try {
        const exist = await Shelf.find({ $and:[{shelfOf:req.user.userId},{name:name}] })
        console.log(exist)
        if (exist.length) {
            return res.status(400).json({ msg: "A shelf with this name already existed!" });
          }
      const shelf = await Shelf.create({
        name,
        shelfOf: req.user.userId,
      });

      return res.status(200).json({ msg:"New shelf created!", shelf: shelf });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ msg: err });
    }
  };

  const bookToShelf = async (req, res) => {
    const { book, selected, nonSelected } = req.body;
  
    if (!book.length || (!selected&&!nonSelected)) {
      return res.status(400).json({ msg: "Book and shelves are required!" });
    }
    
    
    try {
        if (selected) {selected.forEach(async (item)=>  {
      const selectedShelf = await Shelf.findByIdAndUpdate(item, {
        $addToSet: {
            books: book,
        },})
     
            })}
        
        if(nonSelected) {
            nonSelected.forEach(async (item)=>  {
      const selectedShelf = await Shelf.findByIdAndUpdate(item, {
        $pull: {
            books: book,
        },})
                
                
            })
        }

      return res.status(200).json({ selected });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ msg: err });
    }
  };

  const getShelves = async (req, res) => {
    try {
      const userId = req.params.userId;
      const shelves = await Shelf.find({ shelfOf: userId })
      return res.status(200).json({ shelves });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };
  
  const getSelectedShelves= async (req, res) => {
    const book  = req.params.book;

    try {
      const shelves = await Shelf.find({ $and:[{shelfOf: req.user.userId }, {books: { $in: [book] }}]})
      const id = shelves.map((x)=>x._id)
      return res.status(200).json({ id });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const getShelf = async(req,res) => {
    const { shelfId } = req.params
    try {
      
      const shelf = await Shelf.findById(shelfId)
        .populate("books")
        .sort({ createdAt: -1 });
      return res.status(200).json({ shelf });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };
  
  const editShelf = async(req,res) => {
    const { shelfId, name } = req.body
    try {
      
      const shelf = await Shelf.findByIdAndUpdate(shelfId, {name})
      return res.status(200).json({ shelf, msg:"Shelf renamed" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  const deleteShelf = async(req,res) => {
    const { shelfId } = req.body
    try {
      
      const shelf = await Shelf.findByIdAndDelete(shelfId)
      return res.status(200).json({ shelf, msg:"Shelf deleted" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: error });
    }
  };

  export {
    createShelf,
    bookToShelf,
    getShelves,
    getSelectedShelves,
    getShelf,
    editShelf,
    deleteShelf
  }