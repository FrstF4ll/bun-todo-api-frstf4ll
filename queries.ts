import db from "./db"
export const getTodos = () => {
    try {
        return db.query(`select * from todos`).all()
    }
    catch {
        throw new Error("Failed to get datas")
    }
};

export const createTodo = () => {
    try {
        return db.query(`INSERT INTO todos(title, content, due_date, done)
                             VALUES ($title, $content, $due_date, $done)`)
    } catch {
        throw new Error("Failed to get datas")
    }
};
