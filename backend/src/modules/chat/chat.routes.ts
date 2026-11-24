import { Router } from "express";
import { createMessage } from "./chat.controller";

const router = Router();

router.post("/messages", createMessage);

export default router;