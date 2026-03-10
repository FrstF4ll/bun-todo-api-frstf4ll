import { initDB } from "./db.ts";
import { createTodo, deleteTodo, getTodos, updateTodo } from './queries.ts';
import { validateProperty, validateSchema } from "./valibot.ts";
import {deleteAllTodos} from "./queries.ts";

const getCorsHeaders = (req: Request) => {
    const requestHeaders = req.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization";
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": requestHeaders,
        "Access-Control-Max-Age": "86400",
    };
};

initDB();
const server = Bun.serve({
    port: 3000,
    routes: {
        "/todos": {
            OPTIONS: (req) => new Response(null, { status: 204, headers: getCorsHeaders(req) }),
            GET: (req) => Response.json(getTodos(), { status: 200, headers: getCorsHeaders(req) }),
            POST: async req => {
                try {
                    const body = await req.json();
                    const validation = validateSchema(body)
                    if (!validation.success) {
                        return Response.json(validation.errors, { status: 400, headers: getCorsHeaders(req) })
                    }
                    const newTodo = await createTodo(validation.data)
                    return Response.json(newTodo, { status: 201, headers: getCorsHeaders(req) })
                } catch (err) {
                    console.error(err)
                    return new Response("Internal Server Error", { status: 500, headers: getCorsHeaders(req) })
                }
            },
            DELETE: (req) => {
                deleteAllTodos();
                return new Response(null, { status: 204, headers: getCorsHeaders(req) });
            }
        },
        "/todos/:id": {
            OPTIONS: (req) => new Response(null, { status: 204, headers: getCorsHeaders(req) }),
            DELETE: req => {
                try {
                    const id = Number(req.params.id)
                    const result = deleteTodo(id)
                    if (result.changes === 0) {
                        return Response.json(null, { status: 404, headers: getCorsHeaders(req) })
                    }
                    return Response.json(null, { status: 204, headers: getCorsHeaders(req) })
                } catch (err) {
                    console.error(err)
                    return new Response("Internal Server Error", { status: 500, headers: getCorsHeaders(req) })
                }
            },
            PATCH: async req => {
                try {
                    const body = await req.json()
                    const id = Number(req.params.id)
                    if (isNaN(id)) {
                        return Response.json({ error: "Invalid ID" }, { status: 400, headers: getCorsHeaders(req) })
                    }
                    const validation = validateProperty(body)
                    if (!validation.success) {
                        return Response.json(validation.errors, { status: 400, headers: getCorsHeaders(req) })
                    }
                    const result = updateTodo(id, validation.data)
                    return Response.json(result, { status: 200, headers: getCorsHeaders(req) })
                } catch (err) {
                    console.error(err)
                    return new Response("Internal Server Error", { status: 500, headers: getCorsHeaders(req) })
                }
            },
        }, "/": (req) => Response.json({ error: "Not Found" }, { status: 404, headers: getCorsHeaders(req) })
    }
});

console.log(`Listening on ${server.url}`);