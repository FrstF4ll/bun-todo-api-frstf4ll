import db from "./db";

export const getTodos = () => {
    try {
        return db.query(`select * from todos`).all()
    }
    catch {
        throw new Error("Failed to get datas")
    }
};



export const createTodo = (data: { $title: string, $content: string | null, $due_date: string | null, $done: 0 | 1 }) => {
    try {
        const query = db.query(`
        INSERT INTO todos (title, content, due_date, done)
        VALUES ($title, $content, $due_date, $done)
        RETURNING *
    `);
        return query.get(data);
    } catch {
        throw new Error("Failed to post datas")
    }
};


export const deleteTodo = ($id: number) => {
try{
    const query = db.query(`delete from todos where id = $id`)
    const result = query.run({$id})
    return result
} catch(err){
    console.error("Failed to delete todo:", err);
    throw new Error("Failed to delete todo")
}
}