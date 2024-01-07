import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import cloudinary from "cloudinary";
// import OpenAI from "openai";
import { BingChat } from "bing-chat-rnz";
// import { BingAIClient } from "@waylaidwanderer/chatgpt-api";
import mongoose from "mongoose";
import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";
import OpenAI from "openai";

cloudinary.v2.config({
  cloud_name: "dksyipjlk",
  api_key: "846889586593325",
  api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
});

const api = new BingChat({
  cookie:
    "1WuqLKrFr0QR_kEOqCT6qMy_4VBUK_RWZxOfeXFzNaBLZy6qn4PCvtw1xQnyEkyVFtDRwafbowdR6rtzMbs__YbnHJuQxgmm6NOhlnaUrUc4elZODqv1cjQNpGHH7bBNDZeBpDF17PfdtUAKFQfivNmn2Vg2IC_BiIEDPSpWMkTE9q77BL_1HW_jLmyofo3CkJIxNRXXSXo3uPDjfqy7YCjiT3vDJlpjeST9i5nEUyEk",
});

const getAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Conversation.find({ members: { $in: userId } })
      .populate("members", "name _id image")
      .populate({
        path: "content",
        populate: { path: "sentBy", select: "name _id image" },
      })
      .sort({ updatedAt: -1 });

    const result = messages.map((message) => {
      const contentExcludeDelete = message.content.filter(
        (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
      );
      message.content = contentExcludeDelete;
      return message;
    });

    // const final = result.filter((each) => {
    //   return each.content.length !== 0;
    // });

    return res.status(200).json({ conversations: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: `Something went wrong. Try again!` });
  }
};

const getUnread = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const conversations = await Conversation.aggregate([
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversation",
          as: "data",
        },
      },
      {
        $unwind: "$data",
      },
      {
        $match: {
          "data.readBy": {$nin: [mongoose.Types.ObjectId(userId)]}
        }
      },
      {
        $match: {
          "members": {$in: [mongoose.Types.ObjectId(userId)]}
        }
      },
      {
        $group: {
          _id: "$_id",
          // Include any other fields you want in the result
        }
      }
    ])

   console.log(conversations)
    return res.status(200).json({ unread: conversations });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: `Something went wrong. Try again!` });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    let data = { sentBy: userId, readBy: [userId] };
    const { receivedId, text, image } = req.body;
    console.log(receivedId);

    const limit = req.body.limit || 10;
    if (!receivedId) {
      return res.status(400).json({ msg: `Missing received people` });
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

    let conversation = await Conversation.findOne({
      members: { $all: [...receivedId, userId] },
    });

    if (conversation) {
      data.conversation = conversation._id;
      await Message.create(data);
    } else {
      conversation = await Conversation.create({
        members: [...receivedId, userId].sort(),
      });
      data.conversation = conversation._id;
      const message = await Message.create(data);
      console.log(message);
    }

    conversation = await Conversation.findByIdAndUpdate(conversation._id, {
      $set: { updatedAt: new Date() }
    })
      .populate("members", "name _id image")
      .populate({
        path: "content",
        populate: { path: "sentBy", select: "name _id image" },
      })
      .sort({ updatedAt: -1 });

    const contentExcludeDelete = conversation.content.filter(
      (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
    );

    conversation.content = contentExcludeDelete;


    return res.status(200).json({ conversation });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong!Try again!" });
  }
};

const getAIRes = async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  try {
    const userId = req.user.userId;
    let { text, thread } = req.body;
    if (!text) {
      return res.status(400).json({ msg: "Text  is required!" });
    }

    if (thread) {
      await openai.beta.threads.messages.create(thread, {
        role: "user",
        content: text,
      });
    } else {
      thread = await openai.beta.threads.create();
      thread = thread.id;
      await openai.beta.threads.messages.create(thread, {
        role: "user",
        content: text,
      });
    }

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread, {
      assistant_id: process.env.ASSISTANT_KEY,
    });

    // Create a response
    let response = await openai.beta.threads.runs.retrieve(thread, run.id);

    // Wait for the response to be ready
    while (response.status === "in_progress" || response.status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      response = await openai.beta.threads.runs.retrieve(thread, run.id);
    }

    const messageList = await openai.beta.threads.messages.list(thread);

    const lastMessage = messageList.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    let resText = lastMessage.content[0]["text"].value;

    let index = resText.indexOf("However, ");

    if (index !== -1) {
      // Extract the substring starting from the first occurrence of "however"
      resText = resText.substring(index + "However, ".length);

      // Make the first letter of the new string uppercase
      resText = resText.charAt(0).toUpperCase() + resText.slice(1);
    }

    resText = resText.replace(/【.*?】/g, "");

    const botReponse = {
      text: resText,
      sentBy: process.env.AI_ID,
      readBy: [process.env.AI_ID],
    };


    let conversation = await Conversation.findOne({
      members: { $all: [process.env.AI_ID, userId] },
    });

    botReponse.conversation = conversation._id;
    await Message.create(botReponse);

    conversation = await Conversation.findByIdAndUpdate(conversation._id, {
      $set: { updatedAt: new Date() }
    })
      .populate("members", "name _id image")
      .populate({
        path: "content",
        populate: { path: "sentBy", select: "name _id image" },
      })
      .sort({ updatedAt: -1 });

    const contentExcludeDelete = conversation.content.filter(
      (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
    );

    conversation.content = contentExcludeDelete;

    return res.status(200).json({ conversation, thread });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong!Try again!" });
  }
};

const createGroup = async (req, res) => {
  try {
    console.log("aaaaaaaaaa");
    const userId = req.user.userId;
    const { name, people } = req.body;
    if (!name) {
      return res.status(400).json({ msg: `Name is missing` });
    }
    if (people.length < 2) {
      return res.status(400).json({ msg: "There must be more than 2 people" });
    }

    let conversation = await Conversation.create({
      members: [...people, userId].sort(),
      name,
    });
    console.log("bbbbbbb");
    return res.status(200).json({ conversation });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong!Try again!" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { messageId } = req.body;

    const message = await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deleteBy: userId },
    });

    const conversation = await Conversation.findById(message.conversation)
      .populate("members", "name _id image")
      .populate({
        path: "content",
        populate: { path: "sentBy", select: "name _id image" },
      })
      .sort({ updatedAt: -1 });

    const contentExcludeDelete = conversation.content.filter(
      (each) => !each.deleteBy.includes(mongoose.Types.ObjectId(userId))
    );

    conversation.content = contentExcludeDelete;

    return res.status(200).json({ conversation });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong! Try again!" });
  }
};

const markRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    console.log("aaaaaa");
    console.log(id);
    await Message.updateMany(
      { conversation: id },
      {
        $addToSet: { readBy: userId },
      }
    );

    return res.status(200).json({ msg: "Success!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Something went wrong! Try again!" });
  }
};

// const getAssistant =  async (req, res) => {
//   const body = req.body;
//   const message = body.message;

//   if (!(message)) {
//     return res.status(400).send({ error: "Data not formatted properly" });
//   }

//   const assistant = new OpenAIAssistantRunnable({
//     assistantId: "asst_cYRFEk1dboldcEihCqsgsk2P"
//     // process.env.ASSISSTANT_ID,
//   });

//   await assistant.invoke({
//     content: message,
//     thread_id: "thread_lIeqSVw25QNGlA3QU60cmmb5",
//   }).then((result) => {
//     console.log("load chain");
//     console.log(result);
//     res.status(200).send({
//       full: result[0],
//       message: result[0].content[0].text.value,
//     });
//   }).catch((err) => {
//     console.log(err);
//     res.status(200).send({
//       message: "Hệ thống đang bận, vui lòng thử lại sau.",
//     });
//   });
// };

const getAssistant = async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  try {
    const body = req.body;
    const text = body.message;

    await openai.beta.threads.messages.create(
      "thread_lIeqSVw25QNGlA3QU60cmmb5",
      {
        role: "user",
        content: text,
      }
    );

    // Run the assistant
    const run = await openai.beta.threads.runs.create(
      "thread_lIeqSVw25QNGlA3QU60cmmb5",
      {
        assistant_id: "asst_cYRFEk1dboldcEihCqsgsk2P",
      }
    );

    // Create a response
    let response = await openai.beta.threads.runs.retrieve(
      "thread_lIeqSVw25QNGlA3QU60cmmb5",
      run.id
    );

    // Wait for the response to be ready
    while (response.status === "in_progress" || response.status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      response = await openai.beta.threads.runs.retrieve(
        "thread_lIeqSVw25QNGlA3QU60cmmb5",
        run.id
      );
    }

    const messageList = await openai.beta.threads.messages.list(
      "thread_lIeqSVw25QNGlA3QU60cmmb5"
    );

    const lastMessage = messageList.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    res.status(200).json({
      //       full: result[0],
      message: lastMessage.content[0]["text"].value,
    });
  } catch (e) {
    res.status(400).json({
      //       full: result[0],
      message: "something went wrong",
    });
  }
};

const findAIChat = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log([process.env.AI_ID, userId].sort());
    let conversation = await Conversation.findOne({
      members: { $all: [process.env.AI_ID, userId] },
    });
    return res.status(200).json({ conversation });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "error" });
  }
};

export {
  getAll,
  sendMessage,
  deleteMessage,
  getUnread,
  markRead,
  getAIRes,
  getAssistant,
  createGroup,
  findAIChat,
};
