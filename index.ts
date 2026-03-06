import index from './index.html'
import db, {initDB, getDB} from "./db.ts";
initDB();
const server = Bun.serve({
  port: 3000,
  routes: {
    "/todos": {
      GET: () => Response.json(getDB())
    },
  }
});

console.log(`Listening on ${server.url}`);