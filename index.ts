import { initDB } from "./db.ts";
import {createTodo, deleteTodo, getTodos, type Todo, updateTodo} from './queries.ts';
import { validateProperty, validateSchema } from "./valibot.ts";
import {deleteAllTodos} from "./queries.ts";
import {hexadecimal} from "valibot";

const getCorsHeaders = (req: Request) => {
    const requestHeaders = req.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization";
    return {
        "Access-Control-Allow-Origin": "*", // TODO : Set up for github pages with link : https://frstf4ll.github.io/web-todo-react/
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": requestHeaders,
        "Access-Control-Max-Age": "86400",
    };
};

const sendJson = <T>(body:T ,status: number, req: Bun.BunRequest) => Response.json(body, {status: status, headers: getCorsHeaders(req)})

initDB();
const server = Bun.serve({
    port: 3000,
    routes: {
        "/todos": {
            OPTIONS: (req) => new Response(null, { status: 204, headers: getCorsHeaders(req) }),
            GET: (req) => sendJson(getTodos(), 200, req),
            POST: async req => {
                try {
                    const body = await req.json();
                    const validation = validateSchema(body)
                    if (!validation.success) {
                        return sendJson(validation.errors, 400 ,req)
                    }
                    const newTodo = await createTodo(validation.data)
                    return sendJson(newTodo,  201, req)
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
                        return sendJson(null,  404, req)
                    }
                    return sendJson(null, 204,  req)
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
                        return sendJson({ error: "Invalid ID" }, 400, req)
                    }
                    const validation = validateProperty(body)
                    if (!validation.success) {
                        return sendJson(validation.errors, 400,req )
                    }
                    const result = updateTodo(id, validation.data)
                    return sendJson(result,  200, req)
                } catch (err) {
                    console.error(err)
                    return new Response("Internal Server Error", { status: 500, headers: getCorsHeaders(req) })
                }
            },
        }, "/": (req) => sendJson({ error: "Not Found" }, 404,req)
    }
});

console.log(`Listening on ${server.url}`);