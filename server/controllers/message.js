import Message from "../models/message.js";
import cloudinary from "cloudinary";
// import OpenAI from "openai";
import { BingChat } from "bing-chat-rnz";
// import { BingAIClient } from "@waylaidwanderer/chatgpt-api";
import mongoose from "mongoose";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const api = new BingChat({
  cookie:
    "1WuqLKrFr0QR_kEOqCT6qMy_4VBUK_RWZxOfeXFzNaBLZy6qn4PCvtw1xQnyEkyVFtDRwafbowdR6rtzMbs__YbnHJuQxgmm6NOhlnaUrUc4elZODqv1cjQNpGHH7bBNDZeBpDF17PfdtUAKFQfivNmn2Vg2IC_BiIEDPSpWMkTE9q77BL_1HW_jLmyofo3CkJIxNRXXSXo3uPDjfqy7YCjiT3vDJlpjeST9i5nEUyEk",
});


const getAllMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Message.find({ members: { $in: userId } })
      .populate(
        "members",
        "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
      )
      .populate(
        "content.sentBy",
        "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
      )
      .sort({ updatedAt: -1 });
    const result = messages.map((message) => {
      const contentExcludeDelete = message.content.filter(
        (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
      );
      message.content = contentExcludeDelete;
      return message;
    });

    console.log(result);
    const final = result.filter((each) => {
      return each.content.length !== 0;
    });

    console.log(final);
    return res.status(200).json({ messages: final });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: `Something went wrong. Try again!` });
  }
};

const getUnread = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Message.find({
      $and: [
        { members: { $in: userId } },
        { content: { $elemMatch: { readBy: { $nin: [userId] } } } },
      ],
    })
    // console.log()
    return res.status(200).json({ unread: messages.length });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: `Something went wrong. Try again!` });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    let data = { sentBy: userId, readBy:[userId] };
    const { receivedId, text, image } = req.body;
    console.log(receivedId);

    const limit = req.body.limit || 10;
    if (!receivedId) {
      return res.status(400).json({ msg: `Something went wrong! Try again!` });
    }
    if (image) {
      data.image = image;
    }
    if (text) {
      data.text = text;
    }
    if (!image && !text) {
      return res.status(400).json({ msg: "Text or image is required!" });
    }
    // data.seen
    let message = await Message.findOneAndUpdate(
      {
        members: [receivedId, userId].sort(),
      },
      {
        $addToSet: { content: data },
      },
      { new: true }
    )
      .populate(
        "content.sentBy",
        "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
      )
      .populate(
        "members",
        "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
      );

    if (!message) {
      message = await Message.create({
        members: [userId, receivedId].sort(),
        content: data,
      });
      message = await Message.findById(message._id)
        .populate(
          "members",
          "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
        )
        .populate(
          "content.sentBy",
          "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
        );
    }
   

    const contentExcludeDelete = message.content.filter(
      (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
    );

    // console.log(contentExcludeDelete)

    message.content = contentExcludeDelete;
    // if(!ai_res) return res.status(200).json({ message: message });
    return res.status(200).json({ message: message });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong!Try again!" });
  }
};

const getAIRes = async(req,res)=> {
  try{    const userId = req.user.userId;
    const {  text } = req.body;
  

    if (!text) {
      return res.status(400).json({ msg: "Text  is required!" });
    }

      const reply = await api.sendMessage(text);

      const botReponse = {
        text: reply.text,
        sentBy: process.env.AI_ID,
        readBy:[process.env.AI_ID]
      };

      let message = await Message.findOneAndUpdate(
        {
          members: [process.env.AI_ID, userId].sort(),
        },
        {
          $addToSet: { content: botReponse },
        },
        { new: true }
      )
        .populate(
          "content.sentBy",
          "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
        )
        .populate(
          "members",
          "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
        );


    const contentExcludeDelete = message.content.filter(
      (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
    );


    message.content = contentExcludeDelete;

    return res.status(200).json({ message: message});
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong!Try again!" });
  }
}

const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const { contentId, messageId } = req.body;

    let message = await Message.findById(messageId)
   

    let content = message.content;
    const index = content.findIndex((one) => one._id.toString() === contentId);

    content[index].deleteBy.push(userId);

    // console.log(content);

    let newMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content,
      },
      { new: true }
    )
      .populate(
        "content.sentBy",
        "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
      )
      .populate(
        "members",
        "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
      );

    const contentExcludeDelete = newMessage.content.filter(
      (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
    );

    // console.log(contentExcludeDelete)

    newMessage.content = contentExcludeDelete;

    return res.status(200).json({ message: newMessage });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong! Try again!" });
  }
};

const markRead = async (req, res) => {
    try {
      const userId = req.user.userId;
      // let data = { sentBy: userId };
      const { id } = req.params;
      // console.log(receivedId)
        console.log(id)
      let message = await Message.findById(id)
  
      let content = message.content;
      const newContent = content.map((one) => {
        if(!one.readBy.includes(mongoose.Types.ObjectId(userId))) {
            one.readBy.push(mongoose.Types.ObjectId(userId))
            return one
        } return one
      });
  
      let newMessage = await Message.findByIdAndUpdate(
        id,
        {
          content: newContent,
        },
        { new: true }
      )
        .populate(
          "content.sentBy",
          "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
        )
        .populate(
          "members",
          "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
        );

  
      return res.status(200).json({ msg: "Success!" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Something went wrong! Try again!" });
    }
  };

export { getAllMessages, sendMessage, deleteMessage, getUnread, markRead, getAIRes };
