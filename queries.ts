import db from "./db";
import { sql } from "bun";

export const getTodos = () => {
    try {
        return db.query(`select * from todos`).all()
    }
    catch {
        throw new Error("Failed to get datas")
    }
};

export const createTodo = async () => {
    try {
        await sql`INSERT INTO todos(title, content, due_date, done)
                             VALUES ($title, $content, $due_date, $done)
                             RETURNING *`;
    } catch {
        throw new Error("Failed to post datas")
    }
};
