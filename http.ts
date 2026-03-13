type ValidatorFn = (data: unknown) => { success: boolean; data?: any; errors?: any }
type statusResponse<T> = {
    req: Bun.BunRequest<string>
    status?: number,
    body?: T
    id?: number,
}

const getCorsHeaders = (req: Bun.BunRequest<string>) => {
    const requestHeaders = req.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization";
    return {
        "Access-Control-Allow-Origin": "*", // TODO : Set up for github pages with link : https://frstf4ll.github.io/web-todo-react/
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": requestHeaders,
        "Access-Control-Max-Age": "86400",
    };
};
export const HTTP = {
    SUCCESS: {OK: 200, CREATED: 201, NO_CONTENT: 204},
    FAIL: {BAD_REQUEST: 400, NOT_FOUND: 404, SERVER_ERROR: 500}
}

const responseInit = <T>({status, req}: statusResponse<T>) => ({status, headers: getCorsHeaders(req)});
export function sendResponse({ req, status, body }: statusResponse<unknown>) {
    const init = responseInit({ status, req })
    return body ? Response.json(body, init) : new Response(null, init)
}

export function parseRequest(validator: ValidatorFn, {req, id, body}: statusResponse<unknown>) {
    try {
        if (id !== undefined && isNaN(id)) {
            return { error: sendResponse({ status: HTTP.FAIL.BAD_REQUEST, body: { error: "Invalid ID" }, req }) }
        }
        if (body) {
            const validation = validator(body)
            if (!validation.success) {
                return { error: sendResponse({ status: HTTP.FAIL.BAD_REQUEST, body: validation.errors, req }) }
            }
            return { data: validation.data }
        }
        return { data: null }
    } catch (err) {
        console.error(err)
        return { error: sendResponse({ status: HTTP.FAIL.SERVER_ERROR, req }) }
    }
}

