import Shelf from '../models/shelf.js';

const canUpdateOrDeleteShelf = async (req, res, next) => {

    try {
        // const shelf_id = req.params.id;
        const { shelfId } = req.body
        const { userId } = req.user;
        const shelf = await Shelf.findById(shelfId)
        if (!shelf) {
            return res.status(400).json({ msg: "No shelf found!" })
        }
        if (userId !== shelf.owner.toString()) {
            return res.status(401).json({ msg: "Authentication invalid!" })
        }
        next();
    } catch (error) {
        console.log('Authentication invalid!');
        return res.status(401).json({ msg: 'Authentication invalid!' });
    }
}

export default canUpdateOrDeleteShelf;