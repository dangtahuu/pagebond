import Prompt from "../models/prompt.js";

import mongoose from "mongoose";

const getPrompts = async (req, res) => {

  try {
   
    const prompts1 = await Prompt.aggregate([
        {
            $match: {
                type: 1
            }
        },{
            $sample: { size: 2}
        }
    ])

    const prompts2 = await Prompt.aggregate([
        {
            $match: {
                type: 2
            }
        },{
            $sample: { size: 4}
        }
    ])

    const prompts = [...prompts1,...prompts2]
    return res.status(200).json({ prompts });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err });
  }
};

const create = async(req,res) => {
    const {text, type, book} = req.body
    try {
        let prompt
        if(book) {
            prompt = await Prompt.create({
                text,
                type,
                book
            })
        } else {
            prompt = await Prompt.create({
                text,
                type,
            })
        }
      
        return res.status(200).json({ prompt });
    } catch(err) {
        console.log(err);
        return res.status(400).json({ msg: err });
    }
}

export {
 getPrompts,
 create
};
