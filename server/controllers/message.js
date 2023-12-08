import Message from "../models/message.js";
import cloudinary from "cloudinary";
import OpenAI from 'openai';
import { BingChat } from 'bing-chat-rnz'
import {BingAIClient} from '@waylaidwanderer/chatgpt-api'

cloudinary.v2.config({
    cloud_name: "dksyipjlk",
    api_key: "846889586593325",
    api_secret: "mW4Q6mKi4acL72ZhUYzw-S0_y1A",
  });

  const api = new BingChat({
    cookie: '1eFnAvj4fvs__ZI9YW0QJPW1gzqFCTdE23gFkJIrq_zJ-hoWnrEDO2YS3CCc9duy65mkMWkNrBl9uipgbRYUEjL_N6GaYbojlRlLwHrrW_o3RVAa3en8Dk82x0zUw4VBAb-Uuuoa7jNMis4sKCPl4uXzLV1PefdbsPWKzAsvtw70moZT8AdgD9s90GBrDfNjAhbw154Wo35awYZiUA0KIuFxrhteaaPy4MQCA-y1f4p0'

  })

  const options = {
    // Necessary for some people in different countries, e.g. China (https://cn.bing.com)
    host: '',
    // "_U" cookie from bing.com
    userToken: '1AkkaaLB_M_qBQMtc_H29epe246gB2ODphdo_EOGkk-9yVN8K4Q_LVhdBEJQd9jnNifxuP935SXxhfillctXtAp4NzxUZieI46itpwf8rPW_FFx0p-ATpxnE__fm6guseAScO5vkM19XlDdbTuoZoTbFctKr_iBWpf4thw2TavSd-detfJgPyJZmBYiinm-uJza0yrilyETEftpPr0-nCfstT1lOSNiEYHCxU27YavDM',
    // If the above doesn't work, provide all your cookies as a string instead
    cookies: '',
    // A proxy string like "http://<ip>:<port>"
    proxy: '',
    // (Optional) Set to true to enable `console.debug()` logging
    debug: false,
};

let bingAIClient = new BingAIClient(options);

const openai = new OpenAI({
    apiKey: "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"
    // process.env.API_TOKEN
});

// const openai = new OpenAIApi(config);

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
        return res.status(200).json({ messages });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: `Something went wrong. Try again!` });
    }
};

const sendMassage = async (req, res) => {
    try {
        const userId = req.user.userId;
        let data = { sentBy: userId };
        console.log('aaaa')
        const { receivedId, text, image } = req.body;
        console.log(receivedId)

        const limit = req.body.limit || 10;
        if (!receivedId) {
            return res
                .status(400)
                .json({ msg: `Something went wrong!Try again!` });
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
        ).populate(
            "content.sentBy",
            "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
        ).populate("members", "-password -secret -following -follower -role -updatedAt -email -createdAt -about");

        if (!message) {
            message = await Message.create({
                members: [userId, receivedId].sort(),
                content: data,
            });
            message = await Message.findById(message._id).populate(
                "members",
                "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
            )
                .populate(
                    "content.sentBy",
                    "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
                );
        }
        console.log(message)
        let ai_res
        if (receivedId==='6561e80e6dfae0a11ba298b6') {
            // const response = await openai.chat.completions.create({
            //     model: 'gpt-3.5-turbo',
            //     // prompt: text,
            //     messages: [{"role": "user", "content": text}],
            // });

            const res = await api.sendMessage(text)
            console.log(res)
            // let response = await bingAIClient.sendMessage(text, {
            //     // (Optional) Set a conversation style for this message (default: 'balanced')
            //     toneStyle: 'balanced', // or creative, precise, fast
            //     // onProgress: (token) => {
            //     //     process.stdout.write(token);
            //     // },
            // });
            // const chatCompletion = await openai.chat.completions.create({
            //     model: "gpt-3.5-turbo",
            //     messages: [{"role": "user", "content": "Hello!"}],
            //   });
            // console.log(JSON.stringify(response, null, 2))
            const botReponse = {
                text: res.text,
                sentBy: '6561e80e6dfae0a11ba298b6',
            }

            message = await Message.findOneAndUpdate(
                {
                    members: [receivedId, userId].sort(),
                },
                {
                    $addToSet: { content: botReponse },
                },
                { new: true }
            ).populate(
                "content.sentBy",
                "-password -secret -following -follower -role -updatedAt -email -createdAt -about"
            ).populate("members", "-password -secret -following -follower -role -updatedAt -email -createdAt -about");
            
            ai_res=1
        }
        // if(!ai_res) return res.status(200).json({ message: message });
        return res.status(200).json({ message: message, ai_res });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: "Something went wrong!Try again!" });
    }
};

export { getAllMessages, sendMassage };
