import { Database } from "bun:sqlite";

const db = new Database("todolist.sqlite", { create: true });
export const initDB = () => db.query(`CREATE TABLE IF NOT EXISTS todos
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(150) NOT NULL,
    content VARCHAR(250),   
    due_date VARCHAR(20),
    done BOOLEAN NOT NULL default 0
    )`).run();
export const getTodos = () => {
    try {
        return db.query(`select * from todos`).all()
    }
    catch {
        throw new Error("Failed to get datas")
    }
}


export default db;
