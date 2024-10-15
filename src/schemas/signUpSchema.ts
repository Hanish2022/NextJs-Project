import { z } from 'zod'

export const usernameValidation = z
    .string()
    .min(2, "Username must be atlead 2 characters")
    .max(20, "Must be not more than 20 characters")
    .regex(/^[a-zA-Z0-9_]/, "Username must not contain any special characters")
    

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: 'Invalid email address' }),
    password:z.string()
})  