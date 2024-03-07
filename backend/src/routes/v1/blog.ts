import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';

type ENVIRONMENT = {
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET : string;
  },
  Variables : {
    userId : string
  }

}

const app = new Hono<ENVIRONMENT>()

app.use('/*', async(c, next)=> {
  const authHeader = c.req.header("authorization");
  if(authHeader) {
    const word = authHeader.split(" ");
    try {
      const user = await verify(word[1], c.env.JWT_SECRET);
      if(user) {
        c.set('userId', user.id)
        await next()
      } else {
        c.status(403);
        return c.json({
          message : "You don't have access"
        })
      }
    } catch (error) {
      c.status(403);
      return c.json({
        message : "Authorozation failed"
      })
    }
  } else {
    c.status(403);
    return c.json({
      message : "Authorization token must be provided"
    })
  }
})

app.post('/', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json()
  const authorId = c.get("userId")
  try {
    const response = await prisma.post.create({
      data : {
        title : body.title,
        content : body.content,
        authorId
      }
    })
    if(response) {
      c.status(200);
      return c.json({
        id : response.id
      })

    } else {
      c.status(403);
      return c.json({
        message : "post creation failed"
      })
    }
  } catch (error) {
    c.status(403);
    return c.json({
      message : "Post created failed"
    })
  }
})

app.put('/', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  try {
    const response = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title : body.title,
        content : body.content,
      },
    })
  } catch (error) {
    c.status(403);
    return c.json({
      message : "Post updation failed!"
    })
  }
  return c.text('Hello Binshh!');
})

app.get('/bulk', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const posts = await prisma.post.findMany()
    c.status(200);
    return c.json({
      posts
    })
  } catch (error) {
    c.status(403);
    return c.json({
      message : "post fetching failed!"
    })
  }
})

app.post("/publish", async(c)=> {
  return c.json({
    message : "Published"
  })
})

app.get('/:id', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const id = c.req.param('id');
  try {
    const post = await prisma.post.findUnique({
      where : {
        id
      }
    })
    if(post) {
      c.status(200);
      return c.json({
        post
      })
    } else {
      c.status(403);
      return c.json({
        message : "Post Not Found"
      }) 
    }
  } catch (error) {
    c.status(403);
    return c.json({
      message : "Post Fatching failed"
    }) 
  }
})

export default app;