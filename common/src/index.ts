import zod from 'zod';

export const signUpInput = zod.object({
    username : zod.string().email({ message: "Invalid email address" }),
    name : zod.string().optional(),
    password : zod.string().min(6, { message: "Must be 6 or more characters long" })
});

export const signInInput = zod.object({
    username : zod.string().email({ message: "Invalid email address" }),
    password : zod.string().min(6, { message: "Must be 6 or more characters long" })
});

export const blogCreateInput = zod.object({
    title : zod.string(),
    content : zod.string(),
});

export const blogUpdateInput = zod.object({
    id : zod.string(),
    title : zod.string(),
    content : zod.string(),
});

export type SignUpInput = zod.infer<typeof signUpInput>
export type SignInInput = zod.infer<typeof signInInput>
export type BlogCreateInput = zod.infer<typeof blogCreateInput>
export type BlogUpdateInput = zod.infer<typeof blogUpdateInput>
