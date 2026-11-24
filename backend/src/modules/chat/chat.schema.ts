import {z} from 'zod';

export const sendMessageSchema = z.object({
    username: z.string().min(1).max(100),
    message: z.string().min(1).max(1000),
})

export type sendMessageInput = z.infer<typeof sendMessageSchema>