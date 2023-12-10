// @ts-ignore
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
// @ts-ignore
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// Middle
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
// import {Configuration, OpenAIApi} from'openai';
import auth from "./routes/auth.js";
import post from "./routes/post.js";
import message from "./routes/message.js";
import shelf from "./routes/shelf.js";
import book from "./routes/book.js";
import review from "./routes/review.js"
import trade from "./routes/trade.js"
import special from "./routes/special.js"
import log from "./routes/log.js"
import voucher from "./routes/voucher.js"



import requireSignIn from "./middleware/authentication.js";
import * as http from "http";
import {Server} from "socket.io";

const app = express();
// @ts-ignore
const server = http.createServer(app);
//const io = new Server(server);

const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_HOST,
            "http://localhost:3000",
        ],
        methods: ["GET", "POST", "PUT", "PATCH"],
        allowedHeaders: ["Content-type"],
    },
});

if (process.env.NODE_ENV !== "production") {
    // @ts-ignore
    app.use(morgan("dev"));
}

// @ts-ignore
app.use(express.json({limit: "5mb"}));
// @ts-ignore
app.use(express.urlencoded({extended: true}));

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
// @ts-ignore
// app.use(
//     cors({
//         origin: "*"
//     })
// );

app.use(cors(corsOptions));



// const config = new Configuration({
//     apiKey: process.env.API_TOKEN
// });

// const openai = new OpenAIApi(config);

// @ts-ignore
app.use("/api/auth", auth);
// @ts-ignore
app.use("/api/post", requireSignIn, post);
// @ts-ignore
app.use("/api/message", requireSignIn, message);

app.use("/api/shelf", requireSignIn, shelf);

app.use("/api/book", requireSignIn, book);

app.use("/api/review", requireSignIn, review);

app.use("/api/trade", requireSignIn, trade);

app.use("/api/special", requireSignIn, special);
app.use("/api/log", requireSignIn, log);
app.use("/api/voucher", requireSignIn, voucher);






// @ts-ignore
app.use("/", (req, res) => {
    res.send("Welcome to my api!");
});

// io.on("connect", (socket) => {
//     socket.on("send-message", (message) => {
//         socket.broadcast.emit("receive-message", message);
//     });
// });

io.on("connect", (socket) => {
    // socket.on("new-post", (newPost) => {
    //     console.log("new-post", newPost);
    //     socket.broadcast.emit("new-post", newPost);
    // });
    // socket.on("new-comment", (newComment) => {
    //     //console.log("new-post", newPost);
    //     socket.broadcast.emit("new-comment", newComment);
    // });
    socket.on("new-message", (newMessage) => {
        socket.broadcast.emit("new-message", newMessage);
    });
});

const port = process.env.PORT || 8000;

// @ts-ignore
app.use(notFound);
// @ts-ignore
app.use(errorHandlerMiddleware);

const start = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose
            .connect(process.env.URL_2)
            .then(() => console.log("MongoDb connected"));

        server.listen(port, () => {
            console.log("Server is running on port", port);
        });
    } catch (error) {
        console.log(error);
    }
};

start();

