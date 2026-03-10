import db from "./db";

export interface Todos {
    $title: string,
    $content: string | null,
    $due_date: string | null,
    $done: 0 | 1
}

interface BunSQLiteResult {
    changes: number;
    lastInsertRowid: number | bigint;
}

const mapTodo = (row: any): Todos => ({
    ...row,
    done: row.done === 1
});

export const getTodos = () => {
    try {
        const todos = db.query(`select *
                         from todos`).all()
        return todos ? todos.map(mapTodo) : null
    } catch {
        throw new Error("Failed to get datas")
    }
};


export const createTodo = (data: {
    $title: string,
    $content: string | null,
    $due_date: string | null,
    $done: 0 | 1
}) => {
    try {
        const query = db.query(`
            INSERT INTO todos (title, content, due_date, done)
            VALUES ($title, $content, $due_date, $done)
            RETURNING *
        `);
        const todos = query.get(data);
        return todos ? [mapTodo(todos)] : null
    } catch {
        throw new Error("Failed to post datas")
    }
};


export const deleteTodo = ($id: number) => {
    try {
        const query = db.query(`delete
                                from todos
                                where id = $id`)
        const result = query.run({$id}) as unknown as BunSQLiteResult
        return result
    } catch (err) {
        console.error("Failed to delete todo:", err);
        throw new Error("Failed to delete todo")
    }
}

export const deleteAllTodos = () => {
    try {
        const query = db.query(`DELETE FROM todos`);
        return query.run(); // Vide tout
    } catch (err) {
        console.error("Failed to clear database:", err);
        throw new Error("Failed to clear database");
    }
}


export const updateTodo = ($id: number, data: any) => {
    try {
        const query = db.query(`update todos
                                set title    = COALESCE($title, title),
                                    content  = coalesce($content, content),
                                    due_date = coalesce($due_date, due_date),
                                    done     = coalesce($done, done)
                                where id = $id
                                returning *
        `)
        const result = query.get({$id, ...data})
        return result ? [mapTodo(result)] : null
    } catch (err) {
        console.error("Failed to update todo:", err)
        throw new Error("Failed to update todo")
    }
}