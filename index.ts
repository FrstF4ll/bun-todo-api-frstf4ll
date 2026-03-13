import {initDB} from "./db.ts";
import {createTodo, deleteTodo, getTodos, updateTodo, deleteAllTodos, type databaseTodos} from './queries.ts';
import {validateProperty, validateSchema} from "./valibot.ts";
import {parseRequest, HTTP, sendResponse} from "./http.ts";

initDB();

const server = Bun.serve({
    port: 3000,
    routes: {
        "/todos": {
            OPTIONS: (req) => sendResponse({ req, status: HTTP.SUCCESS.NO_CONTENT }),
            GET: (req) => sendResponse({ req, status: HTTP.SUCCESS.OK, body: getTodos() }),
            POST: async (req) => {
                try {
                    const body = await req.json()
                    const validation = parseRequest(validateSchema, { req, body })
                    const newTodo = createTodo(validation.data)
                    return sendResponse({ req, status: HTTP.SUCCESS.CREATED, body: newTodo })
                } catch (err) {
                    console.error(err)
                    return sendResponse({ req, status: HTTP.FAIL.SERVER_ERROR })
                }
            },
            DELETE: (req) => {
                deleteAllTodos()
                return sendResponse({ req, status: HTTP.SUCCESS.NO_CONTENT })
            }
        },
        "/todos/:id": {
            OPTIONS: (req) => sendResponse({ req, status: HTTP.SUCCESS.NO_CONTENT }),
            DELETE: (req) => {
                const id = Number(req.params.id)
                const validation = parseRequest(validateSchema, { req, id })
                if (validation.error) return validation.error
                deleteTodo(id)
                return sendResponse({ req, status: HTTP.SUCCESS.NO_CONTENT })
            },
            PATCH: async (req) => {
                try{

                const id = Number(req.params.id)
                const body = await req.json()
                const validation = parseRequest(validateProperty, { req, id, body });
                if (validation.error) return validation.error
                const result = updateTodo(id, validation.data)
                return sendResponse({ req, status: HTTP.SUCCESS.OK, body: result })
                } catch(err) {
                    console.error(err)
                    return sendResponse({req, status: HTTP.FAIL.SERVER_ERROR})
                }
            }
        },
        "/": (req) => sendResponse({ req, status: HTTP.FAIL.NOT_FOUND })
    }
});

console.log(`Listening on ${server.url}`);