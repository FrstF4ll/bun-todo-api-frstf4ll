import { Database } from "bun:sqlite";

const db = new Database("todolist.sqlite", { create: true });
const create = db.query(`CREATE TABLE IF NOT EXISTS todos
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(150) NOT NULL,
    content VARCHAR(250),   
    due_date VARCHAR(20),
    done BOOLEAN NOT NULL default 0
    )`);
export const initDB = () => create.run();
export const getTodos = () => db.query(`select * from todos`).all()


export default db;
