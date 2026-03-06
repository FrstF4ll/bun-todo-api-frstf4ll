import index from './index.html'
import { initDB } from "./db.ts";
import { getTodos } from './queries.ts';
initDB();
const server = Bun.serve({
  port: 3000,
  routes: {
    "/todos": {
      GET: () => Response.json(getTodos())
    },
  }
});

console.log(`Listening on ${server.url}`);