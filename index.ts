import {initDB} from "./db.ts";
import {createTodo, deleteTodo, getTodos, updateTodo} from './queries.ts';
import {validateProperty, validateSchema} from "./valibot.ts";

initDB();
const server = Bun.serve({
    port: 3000,
    routes: {
        "/todos": {
            GET: () => Response.json(getTodos()),
            POST: async req => {
                try {
                    const body = await req.json();
                    const validation = validateSchema(body)
                    if (!validation.success) {
                        return Response.json(validation.errors, {status: 400})
                    }
                    const newTodo = await createTodo(validation.data)
                    return Response.json(newTodo, {status: 201})
                } catch (err) {
                    console.error(err)
                    return new Response("Internal Server Error", {status: 500})
                }
            }
        },
        "/todos/:id": {
            DELETE: req => {
                try {
                    const id = Number(req.params.id)
                    const result = deleteTodo(id)
                    if (result.changes === 0) {
                        return Response.json(null, {status: 404})
                    }
                    return Response.json(null, {status: 204})
                } catch (err) {
                    console.error(err)
                    throw new Response("Internal Server Error", {status: 500})
                }
            },
            PATCH: async req => {
                try {
                    const body = await req.json()
                    const id = Number(req.params.id)
                    const validation = validateProperty(body)
                    if (!validation.success) {
                        return Response.json(validation.errors, {status: 400})
                    }
                    const result = updateTodo(id, validation.data)
                    return Response.json(result)
                } catch (err) {
                    console.error(err)
                    throw new Response("Internal Server Error", {status: 500})
                }
            }
        },
    }
});

console.log(`Listening on ${server.url}`);