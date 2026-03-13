import db from "./db";

export interface SQLBindings {
    $title: string,
    $content: string | null,
    $due_date: string | null,
    $done: 0 | 1
}

export interface SQLRow {
    id: number,
    title: string,
    content: string | null,
    due_date: string | null,
    done: 0 | 1
}

export type Todo = Omit<SQLRow, 'done'> & { done: boolean }

interface BunSQLiteResult {
    changes: number;
    lastInsertRowid: number | bigint;
}

const parseDone = (row: SQLRow): Todo => ({
    ...row,
    done: row.done === 1
});

export const getTodos = () => {
    try {
        const todos = db.query(`select *
                                from todos`).all() as SQLRow[]
        return todos.map(parseDone)
    } catch {
        throw new Error("Failed to get datas")
    }
};


export const createTodo = (data: SQLBindings) => {
    try {
        const result = db.query(`
            INSERT INTO todos (title, content, due_date, done)
            VALUES ($title, $content, $due_date, $done)
            RETURNING *
        `).get(data as any) as SQLRow | null;
        return result ? [parseDone(result)] : null
    } catch (err) {
        console.error(err)
        throw new Error("Failed to post datas")
    }
};

export const deleteTodo = ($id: number) => {
    try {
        const result = db.query(`delete
                                 from todos
                                 where id = $id`).run({$id}) as unknown as BunSQLiteResult
        return result
    } catch (err) {
        console.error("Failed to delete todo:", err);
        throw new Error("Failed to delete todo")
    }
}

export const deleteAllTodos = () => {
    try {
        const query = db.query(`DELETE
                                FROM todos`);
        return query.run();
    } catch (err) {
        console.error("Failed to clear database:", err);
        throw new Error("Failed to clear database");
    }
}


export const updateTodo = (id: number, data: Partial<SQLBindings>) => {
    try {
        const result = db.query(`update todos
                                 set title    = coalesce($title, title),
                                     content  = coalesce($content, content),
                                     due_date = coalesce($due_date, due_date),
                                     done     = coalesce($done, done)
                                 where id = $id
                                 returning *
        `).get({$id: id, ...data} as any) as SQLRow | null
        return result ? [parseDone(result)] : null
    } catch (err) {
        console.error("Failed to update todo:", err)
        throw new Error("Failed to update todo")
    }
}