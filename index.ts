import { initDB } from "./db.ts";
import {createTodo, getTodos} from './queries.ts';
import {validateSchema} from "./valibot.ts";
interface Todo {
  $title: string;
  $content: string | null;
  $due_date: string | null;
  $done: 0 | 1;
}

initDB();
const server = Bun.serve({
  port: 3000,
  routes: {
    "/todos": {
      GET: () => Response.json(getTodos()),
      POST: async req => {
        const body = await req.json();
        const validation = validateSchema(body)
        if (!validation.success) {
          return Response.json(validation.errors, {status: 400})
        }
        await createTodo(validation.data)
        return Response.json({created: true, ...validation.data})
      }
    },
  }
});

console.log(`Listening on ${server.url}`);