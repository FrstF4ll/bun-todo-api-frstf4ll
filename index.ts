import index from './index.html'
import db, {initDB} from "./db.ts";
initDB();
const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  }
});

console.log(`Listening on ${server.url}`);