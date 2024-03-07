import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { comparePassword, hashPassword } from '../../util/hashPassword'

type ENVIRMENT = {
    Bindings: {
		DATABASE_URL: string;
        JWT_SECRET : string;
        HASH_KEY: string;
	}
}

const route = new Hono<ENVIRMENT>();

route.post('/signup', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json();
    const hashedPassword  = await hashPassword(body.password, c.env.HASH_KEY); 
    try {
        const response = await prisma.user.create({
            data : {
                email : body.email,
                name : body.name,
                password : hashedPassword
            }
        })
        if(response) {
            try {
                const token = await sign({
                    id : response.id
                }, c.env.JWT_SECRET)
                if(token) {
                    c.status(200);
                    return c.json({
                        token
                    })
                } else {
                    c.status(403);
                    return c.json({
                        message : "Token generation failed"
                    })
                }
            } catch (error) {
                c.status(403);
                return c.json({
                    message : "Jwt generation failed!"
                })
            }
        }
    } catch (error) {
        c.status(403);
        return c.json({
            message : "User already exist or somthing else!"
        });
    }
})

route.post('/signin', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    try {
        const response = await prisma.user.findUnique({
            where : {
                email : body.email
            }
        })
        if(response) {
            const result = await comparePassword(body.password, response.password, c.env.HASH_KEY);
            if(result) {
                try {
                    const token = await sign({
                        id : response.id
                    }, c.env.JWT_SECRET)
                    if(token) {
                        c.status(200);
                        return c.json({
                            token
                        })
                    } else {
                        c.status(403);
                        return c.json({
                            message : "Token generation failed"
                        })
                    }
                } catch (error) {
                    c.status(403);
                    return c.json({
                        message : "Jwt generation failed!"
                    })
                }
            } else {
                c.status(403);
                return c.json({
                    message : "Password not match"
                })
            }
        } else {
            c.status(403);
            return c.json({
                message : "User Not Found"
            })
        }
    } catch (error) {
       c.status(403);
       return c.json({
        message : "User fetchin failed"
       }) 
    }
})

export default route;