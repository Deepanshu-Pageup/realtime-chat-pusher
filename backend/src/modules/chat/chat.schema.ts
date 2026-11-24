import {z} from 'zod';

export const sendMessageSchema = z.object({
    username: z.string().trim().min(1, "Username is required").max(100, "Username must be at most 100 characters"),
    message: z.string().trim().min(1, "Message is required").max(1000, "Message must be at most 1000 characters"),
})

export type sendMessageInput = z.infer<typeof sendMessageSchema>
