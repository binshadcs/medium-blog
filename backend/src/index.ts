import { Hono } from 'hono'
import Routes from './routes/index'

const app = new Hono()

app.route('/api', Routes);

app.get('/status', (c) => {
  c.status(200)
  return c.json({
    message : "Server is up"
  })
})

app.use("/*", async(c)=> {
  c.status(404);
  return c.json({
    message : "Page Not found"
  })
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Internal Server Error', 500)
})

export default app;
//  I try to build an Uber-like app in a decentralized way, how can I do that? any suggestion