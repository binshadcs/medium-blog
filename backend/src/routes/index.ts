import { Hono } from 'hono'
import userRoute from './v1/user';
import blogRoute from './v1/blog';

const Route = new Hono()

// middleware 

Route.route('v1/user', userRoute);
Route.route('v1/blog', blogRoute);

export default Route