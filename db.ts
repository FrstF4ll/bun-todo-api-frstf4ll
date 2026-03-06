import { Database } from "bun:sqlite";

const db = new Database("todolist.sqlite", { create: true });
const query = db.query(`CREATE TABLE todos
(
    id INTEGER PRIMARY KEY NOT NULL,
    title VARCHAR(150) NOT NULL,
    content VARCHAR(250),   
    due_date VARCHAR(20),
    done BOOLEAN NOT NULL
    )`);
query.run();