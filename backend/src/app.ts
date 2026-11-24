import express from "express";
import cors from 'cors'
import { env } from "./config/env";


export const app = express();


app.use(cors({
    origin: env.CORS_ORIGINS,
    credentials: true
}))


app.use(express.json())

app.get('health' , (req , res) => {
    res.status(200).json({
        success:true,
        message:'Chat server is running'
    })
})

// Routes

import chatRoutes from "./modules/chat/chat.routes";

app.use("/api/chat", chatRoutes);