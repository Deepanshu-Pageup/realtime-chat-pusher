import express from "express";
import cors from 'cors'
import { env } from "./config/env";
import chatRoutes from "./modules/chat/chat.routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";


export const app = express();


app.use(cors({
    origin: env.CORS_ORIGINS,
    credentials: true
}))


app.use(express.json({ limit: '10kb' }))

app.get('/health' , (_req , res) => {
    res.status(200).json({
        success:true,
        message:'Chat server is running'
    })
})

// Routes
app.use("/api/chat", chatRoutes);

// Error handling (must be registered last)
app.use(notFoundHandler);
app.use(errorHandler);
